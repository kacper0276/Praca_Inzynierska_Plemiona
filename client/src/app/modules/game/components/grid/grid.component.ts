import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { AVAILABLE_BUILDINGS } from '@shared/consts/available-buildings';
import { WebSocketEvent } from '@shared/enums';
import { BuildingData, Resources, RadialMenuOption } from '@shared/models';
import {
  BUILDING_OPTIONS,
  EMPTY_PLOT_OPTIONS,
} from '@shared/consts/radial-menu.options';
import { UserService } from '@modules/auth/services';
import {
  ResourcesService,
  GatheringService,
  ServerService,
} from '@modules/game/services';
import { ToastrService, WebSocketService } from '@shared/services';
import { ArmyVisualState } from '@modules/game/interfaces/army-visual-state.interface';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit, OnDestroy {
  Math = Math;
  gridWidth: number = 5;
  readonly gridHeight: number = 5;
  buildings: (BuildingData | null)[][] = [];
  readonly expansionCost = { wood: 50, clay: 30, iron: 20 };
  readonly maxGridSize = 11;
  expansionMultiplier: number = 1;
  userEmail: string | null = null;
  now: number = Date.now();

  private timerInterval: any;

  isOwnVillage: boolean = true;
  isAttacking = false;

  private villageDataSub: Subscription | undefined;
  private villageErrorSub: Subscription | undefined;
  private buildingFinishedSub: Subscription | undefined;
  private buildingUpdateSub: Subscription | undefined;
  private battleUpdateSub: Subscription | undefined;
  private battleEndedSub: Subscription | undefined;
  private battleErrorSub: Subscription | undefined;

  attackingArmy: ArmyVisualState = {
    x: -200,
    y: -200,
    totalHp: 100,
    maxHp: 100,
    state: 'idle',
    gifUrl: 'assets/gif/fight_dust.gif',
  };

  defendingArmy: ArmyVisualState = {
    x: -200,
    y: -200,
    totalHp: 100,
    maxHp: 100,
    state: 'idle',
    gifUrl: 'assets/gif/fight_dust.gif',
  };

  battleResult: {
    show: boolean;
    winner: 'attacker' | 'defender';
    attackerLosses: number;
    defenderLosses: number;
  } | null = null;

  explosion = {
    gifUrl: 'assets/gif/explosion.gif',
    show: false,
    x: 0,
    y: 0,
  };

  pendingExpansion: {
    side: 'left' | 'right';
    cost: Partial<Resources>;
  } | null = null;

  draggedBuilding: { row: number; col: number } | null = null;

  selectedBuilding: BuildingData | null = null;
  selectedBuildingRow: number | null = null;
  selectedBuildingCol: number | null = null;

  resources: Resources;

  buildMode: boolean = false;
  buildRow: number | null = null;
  buildCol: number | null = null;
  activeRadial: { row: number; col: number } | null = null;
  activeEmptyRadial: { row: number; col: number } | null = null;

  availableBuildings: BuildingData[] = AVAILABLE_BUILDINGS;
  emptyPlotOptions: RadialMenuOption[] = EMPTY_PLOT_OPTIONS;
  buildingOptions: RadialMenuOption[] = BUILDING_OPTIONS;

  public timeLeft$: Observable<number>;

  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly elementRef: ElementRef,
    private readonly gatheringService: GatheringService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly webSocketService: WebSocketService,
    private readonly usersService: UserService,
    private readonly serverService: ServerService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.resources = {
      wood: 0,
      clay: 0,
      iron: 0,
      population: 0,
      maxPopulation: 0,
    };
    this.userEmail = this.activatedRoute.snapshot.params['userEmail'];
    const currentUserEmail = this.usersService.getCurrentUser()?.email;
    this.isOwnVillage = this.userEmail === currentUserEmail;
    this.timeLeft$ = this.gatheringService.timeLeft$;

    if (!this.isOwnVillage) {
      this.buildingOptions = this.buildingOptions.filter(
        (opt) => opt.action === 'details'
      );
      this.emptyPlotOptions = this.emptyPlotOptions.filter(
        (opt) => opt.action === 'inspect'
      );
    }
  }

  canAfford(cost: Partial<Resources>): boolean {
    const svc: any = this.resourcesService as any;
    if (typeof svc.canAfford === 'function') return svc.canAfford(cost);
    const r = this.resources || { wood: 0, clay: 0, iron: 0 };
    return (
      (cost.wood || 0) <= (r.wood || 0) &&
      (cost.clay || 0) <= (r.clay || 0) &&
      (cost.iron || 0) <= (r.iron || 0)
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.activeRadial) return;
    const clickedElement = event.target as HTMLElement;
    const activeCellElement = this.elementRef.nativeElement.querySelector(
      `.grid-row:nth-child(${this.activeRadial.row + 1}) .grid-cell:nth-child(${
        this.activeRadial.col + 1
      })`
    );
    if (activeCellElement && !activeCellElement.contains(clickedElement)) {
      this.activeRadial = null;
    }
  }

  ngOnInit(): void {
    this.initializeGrid();
    this.setupVillageDataListeners();
    this.setupBuildingFinishedListener();
    this.setupBattleListeners();

    if (this.isOwnVillage) {
      this.resourcesService.resources$.subscribe((res) => {
        this.resources = res;
      });
      this.gatheringService.start(1000 * 10);
    }

    this.timerInterval = setInterval(() => {
      this.now = Date.now();
      this.cdr.markForCheck();
    }, 1000);
  }

  private setupBattleListeners(): void {
    this.battleUpdateSub = this.webSocketService
      .on<any>(WebSocketEvent.BATTLE_UPDATE)
      .subscribe((data) => {
        if (!this.isAttacking) this.isAttacking = true;

        this.updateArmyState(this.attackingArmy, data.attacker);
        this.updateArmyState(this.defendingArmy, data.defender);

        if (data.buildings) {
          data.buildings.forEach((bUpdate: any) => {
            if (
              this.buildings[bUpdate.row] &&
              this.buildings[bUpdate.row][bUpdate.col]
            ) {
              const building = this.buildings[bUpdate.row][bUpdate.col];
              if (building) {
                const prevHealth = building.health ?? building.maxHealth ?? 100;
                building.health = bUpdate.health;

                if (bUpdate.health < prevHealth) {
                  this.showExplosion(
                    this.attackingArmy.x + 50,
                    this.attackingArmy.y + 50
                  );
                }
              }
            }
          });
        }

        if (
          this.attackingArmy.state === 'fighting_army' ||
          this.defendingArmy.state === 'fighting_army'
        ) {
          this.showExplosion(
            (this.attackingArmy.x + this.defendingArmy.x) / 2 + 50,
            (this.attackingArmy.y + this.defendingArmy.y) / 2 + 50
          );
        }

        this.cdr.detectChanges();
      });

    this.battleEndedSub = this.webSocketService
      .on<any>(WebSocketEvent.BATTLE_ENDED)
      .subscribe((result) => {
        this.isAttacking = false;
        this.battleResult = {
          show: true,
          winner: result.winner,
          attackerLosses: result.attackerLosses.reduce(
            (sum: number, u: any) => sum + u.lost,
            0
          ),
          defenderLosses: result.defenderLosses.reduce(
            (sum: number, u: any) => sum + u.lost,
            0
          ),
        };
        this.cdr.detectChanges();
      });

    this.battleErrorSub = this.webSocketService
      .on<any>(WebSocketEvent.BATTLE_ERROR)
      .subscribe((err) => {
        this.toastr.showError(err.message);
        this.isAttacking = false;
      });
  }

  private updateArmyState(localArmy: ArmyVisualState, serverData: any) {
    localArmy.x = serverData.x;
    localArmy.y = serverData.y;
    localArmy.totalHp = serverData.totalHp;
    localArmy.maxHp = serverData.maxHp;
    localArmy.state = serverData.state;
  }

  private showExplosion(x: number, y: number): void {
    if (this.explosion.show) return;
    this.explosion.x = x;
    this.explosion.y = y;
    this.explosion.show = true;
    setTimeout(() => {
      this.explosion.show = false;
      this.cdr.detectChanges();
    }, 500);
  }

  startAttack(): void {
    if (this.isOwnVillage) return;

    this.webSocketService.send(WebSocketEvent.ATTACK_START, {
      targetEmail: this.userEmail,
      serverId: this.serverService.getServer()?.id ?? -1,
    });
  }

  private setupBuildingFinishedListener(): void {
    this.buildingUpdateSub = this.webSocketService
      .on<BuildingData>(WebSocketEvent.BUILDING_UPDATE)
      .subscribe((updatedBuilding) => {
        this.updateBuildingInGrid(updatedBuilding);
      });

    this.buildingFinishedSub = this.webSocketService
      .on<BuildingData>(WebSocketEvent.BUILDING_FINISHED)
      .subscribe((finishedBuilding) => {
        if (this.updateBuildingInGrid(finishedBuilding)) {
          if (
            !finishedBuilding.constructionFinishedAt &&
            !finishedBuilding.upgradeFinishedAt &&
            !finishedBuilding.repairFinishedAt
          ) {
            this.toastr.showSuccess(
              this.translate.instant('grid.SUCCESS.BUILDING_FINISHED', {
                name: finishedBuilding.name,
              })
            );
          }
        }
      });
  }

  private updateBuildingInGrid(building: BuildingData | null): boolean {
    if (!building || !building.id) return false;
    for (let r = 0; r < this.buildings.length; r++) {
      for (let c = 0; c < this.buildings[r].length; c++) {
        if (this.buildings[r][c]?.id === building.id) {
          this.buildings[r][c] = building;
          this.buildings[r] = [...this.buildings[r]];
          this.cdr.detectChanges();
          return true;
        }
      }
    }
    return false;
  }

  private setupVillageDataListeners(): void {
    const villageDataHandler = (data: any) => {
      if (data && data.gridSize && data.buildings) {
        this.gridWidth = data.gridSize;
        this.buildings = data.buildings.slice(0, this.gridHeight);
      }
    };

    if (this.isOwnVillage) {
      this.villageDataSub = this.webSocketService
        .onVillageDataUpdate()
        .subscribe(villageDataHandler);
      this.villageErrorSub = this.webSocketService
        .onVillageDataError()
        .subscribe((error) => {
          this.toastr.showError(
            this.translate.instant('grid.ERRORS.LOAD_VILLAGE', {
              error: error.message,
            })
          );
        });
      this.webSocketService.requestVillageData(
        this.serverService.getServer()?.id ?? -1
      );
    } else if (this.userEmail) {
      this.villageDataSub = this.webSocketService
        .onVillageByEmailUpdate()
        .subscribe((payload) => {
          if (payload && payload.email === this.userEmail) {
            villageDataHandler(payload.village);
          }
        });
      this.villageErrorSub = this.webSocketService
        .onVillageByEmailError()
        .subscribe((error) => {
          this.toastr.showError(
            this.translate.instant('grid.ERRORS.LOAD_PLAYER_VILLAGE', {
              error: error.message,
            })
          );
        });
      this.webSocketService.requestVillageByEmail(this.userEmail);
    }
  }

  handleMenuOption(action: string, row: number, col: number): void {
    if (!this.isOwnVillage && action !== 'inspect') return;
    if (action === 'build') {
      this.buildRow = row;
      this.buildCol = col;
      this.buildMode = true;
    } else if (action === 'inspect') {
      this.toastr.showInfo(this.translate.instant('INFO_FIELD', { row, col }));
    }
  }

  handleBuildingMenuOption(action: string, row: number, col: number): void {
    if (!this.isOwnVillage && action !== 'details') return;
    this.activeRadial = null;
    if (action === 'details') {
      this.selectedBuilding = this.buildings[row][col];
      this.selectedBuildingRow = row;
      this.selectedBuildingCol = col;
    } else if (action === 'upgrade') {
      this.upgradeBuildingDirectly(row, col);
    } else if (action === 'destroy') {
      this.demolishBuilding(row, col);
    }
  }

  upgradeBuildingDirectly(row: number, col: number): void {
    const building = this.buildings[row][col];
    if (!building || !building.id) return;
    this.webSocketService.send(WebSocketEvent.BUILDING_UPGRADE, {
      buildingId: building.id,
      serverId: this.serverService.getServer()?.id ?? -1,
    });
  }

  initializeGrid(): void {
    this.buildings = Array(this.gridHeight)
      .fill(null)
      .map(() => Array(this.gridWidth).fill(null));
  }

  requestExpansion(side: 'left' | 'right') {
    if (!this.isOwnVillage) return;
    if (this.gridWidth >= this.maxGridSize) {
      this.toastr.showError(this.translate.instant('MAX_GRID'));
      return;
    }
    const cost = this.getCurrentExpansionCost();
    if (!this.canAfford(cost)) {
      this.toastr.showError(this.translate.instant('NOT_ENOUGH_RES_EXPAND'));
      return;
    }
    this.webSocketService.send(WebSocketEvent.VILLAGE_EXPAND, {
      side,
      cost,
      serverId: this.serverService.getServer()?.id ?? -1,
    });
  }

  getBuildingData(row: number, col: number): BuildingData {
    return (
      this.buildings[row][col] || {
        id: 0,
        name: this.translate.instant('grid.EMPTY_PLOT'),
        level: 0,
        imageUrl: 'assets/img/background_playground.png',
      }
    );
  }

  // --- DRAG AND DROP ---
  onDragEnter(event: DragEvent, row: number, col: number): void {
    if (!this.isOwnVillage) return;
    if (this.draggedBuilding) {
      const targetElement = event.target as HTMLElement;
      const cell = targetElement.closest('.grid-cell');
      if (cell) cell.classList.add('drag-over-active');
    }
  }

  onDragLeave(event: DragEvent): void {
    const targetElement = event.target as HTMLElement;
    const cell = targetElement.closest('.grid-cell');
    if (cell) cell.classList.remove('drag-over-active');
  }

  onDragOver(event: DragEvent): void {
    if (!this.isOwnVillage) return;
    event.preventDefault();
  }

  onDrop(event: DragEvent, row: number, col: number): void {
    event.preventDefault();
    if (!this.isOwnVillage || !this.draggedBuilding) return;

    const fromRow = this.draggedBuilding.row;
    const fromCol = this.draggedBuilding.col;

    if (fromRow === row && fromCol === col) {
      this.cleanupDragState(event);
      return;
    }

    const draggedData = this.buildings[fromRow][fromCol];
    const targetData = this.buildings[row][col];

    if (
      (draggedData && this.getActionState(draggedData) !== 'idle') ||
      (targetData && this.getActionState(targetData) !== 'idle')
    ) {
      this.toastr.showError(
        this.translate.instant('grid.ERRORS.MOVE_UNDER_CONSTRUCTION')
      );
      this.cleanupDragState(event);
      return;
    }

    this.buildings[row][col] = draggedData;
    this.buildings[fromRow][fromCol] = targetData;

    if (draggedData && draggedData.id) {
      this.webSocketService.send(WebSocketEvent.BUILDING_MOVE, {
        buildingId: draggedData.id,
        row: row,
        col: col,
      });
    }
    if (targetData && targetData.id) {
      this.webSocketService.send(WebSocketEvent.BUILDING_MOVE, {
        buildingId: targetData.id,
        row: fromRow,
        col: fromCol,
      });
    }
    this.cleanupDragState(event);
  }

  onDragEnd(event: DragEvent): void {
    this.cleanupDragState(event);
  }

  private cleanupDragState(event: DragEvent | null): void {
    this.draggedBuilding = null;
    document
      .querySelectorAll('.drag-over-active')
      .forEach((el) => el.classList.remove('drag-over-active'));
  }

  onDragStart(row: number, col: number): void {
    if (!this.isOwnVillage) return;
    const building = this.buildings[row][col];
    if (building && this.getActionState(building) !== 'idle') {
      this.toastr.showWarning(this.translate.instant('grid.ERRORS.BUSY'));
      return;
    }
    if (building) {
      this.draggedBuilding = { row, col };
    }
  }

  // --- UI INTERACTIONS ---
  onBuildingClick(row: number, col: number): void {
    const building = this.buildings[row][col];
    if (building) {
      if (
        this.activeRadial &&
        this.activeRadial.row === row &&
        this.activeRadial.col === col
      ) {
        this.activeRadial = null;
      } else {
        this.activeRadial = { row, col };
      }
      this.selectedBuilding = null;
    }
  }

  showEmptyRadial(event: Event, row: number, col: number) {
    event.stopPropagation();
    if (
      this.activeEmptyRadial &&
      this.activeEmptyRadial.row === row &&
      this.activeEmptyRadial.col === col
    ) {
      this.activeEmptyRadial = null;
    } else {
      this.activeEmptyRadial = { row, col };
      this.activeRadial = null;
    }
  }

  onEmptyRadialToggled(isOpen: boolean, row: number, col: number): void {
    if (!isOpen) {
      if (
        this.activeEmptyRadial &&
        this.activeEmptyRadial.row === row &&
        this.activeEmptyRadial.col === col
      ) {
        this.activeEmptyRadial = null;
      }
    }
  }

  closePopup(): void {
    this.selectedBuilding = null;
    this.selectedBuildingRow = null;
    this.selectedBuildingCol = null;
    this.activeRadial = null;
    this.battleResult = null;
  }

  demolishSelected(): void {
    if (!this.isOwnVillage) return;
    if (this.selectedBuildingRow === null || this.selectedBuildingCol === null)
      return;
    this.demolishBuilding(this.selectedBuildingRow, this.selectedBuildingCol);
  }

  onEmptyPlotClick(row: number, col: number): void {
    if (!this.isOwnVillage) return;
    this.buildMode = true;
    this.buildRow = row;
    this.buildCol = col;
  }

  getCurrentExpansionCost(): Partial<Resources> {
    return {
      wood: Math.ceil(
        (this.expansionCost.wood || 0) * this.expansionMultiplier
      ),
      clay: Math.ceil(
        (this.expansionCost.clay || 0) * this.expansionMultiplier
      ),
      iron: Math.ceil(
        (this.expansionCost.iron || 0) * this.expansionMultiplier
      ),
    };
  }

  buildBuilding(building: BuildingData, cost: Partial<Resources>): void {
    if (!this.isOwnVillage) return;
    if (this.buildRow === null || this.buildCol === null) return;
    if (this.resourcesService.spendResources(cost)) {
      this.webSocketService.send(WebSocketEvent.BUILDING_CREATE, {
        name: building.name,
        row: this.buildRow,
        col: this.buildCol,
        serverId: this.serverService.getServer()?.id ?? -1,
      });

      const newBuilding: BuildingData = {
        ...building,
        maxHealth: building.maxHealth ?? 100,
        health: building.health ?? building.maxHealth ?? 100,
      };
      this.buildings[this.buildRow][this.buildCol] = newBuilding;
      this.buildMode = false;
      this.buildRow = null;
      this.buildCol = null;
      if (
        this.selectedBuildingRow === this.buildRow &&
        this.selectedBuildingCol === this.buildCol
      ) {
        this.closePopup();
      }
    } else {
      this.toastr.showError(this.translate.instant('NOT_ENOUGH_RES'));
    }
  }

  demolishBuilding(row: number, col: number): void {
    if (!this.isOwnVillage) return;
    const buildingToDemolish = this.buildings[row][col];
    if (!buildingToDemolish || !buildingToDemolish.id) return;
    this.webSocketService.send(WebSocketEvent.BUILDING_DELETE, {
      buildingId: buildingToDemolish.id,
    });
    this.buildings[row][col] = null;
    this.closePopup();
  }

  upgradeBuilding(event: { cost: Partial<Resources> }) {
    if (!this.isOwnVillage) return;
    if (this.selectedBuildingRow === null || this.selectedBuildingCol === null)
      return;
    const building =
      this.buildings[this.selectedBuildingRow][this.selectedBuildingCol];
    if (building && building.id) {
      this.webSocketService.send(WebSocketEvent.BUILDING_UPGRADE, {
        buildingId: building.id,
        serverId: this.serverService.getServer()?.id ?? -1,
      });
    }
  }

  getConstructionTimeLeft(building: BuildingData): number {
    if (!building || !building.constructionFinishedAt) return 0;
    const end = new Date(building.constructionFinishedAt).getTime();
    return Math.max(0, Math.ceil((end - this.now) / 1000));
  }

  getActionState(
    building: BuildingData
  ): 'construction' | 'upgrade' | 'repair' | 'idle' {
    const now = this.now;
    if (
      building.upgradeFinishedAt &&
      new Date(building.upgradeFinishedAt).getTime() > now
    )
      return 'upgrade';
    if (
      building.constructionFinishedAt &&
      new Date(building.constructionFinishedAt).getTime() > now
    )
      return 'construction';
    if (
      building.repairFinishedAt &&
      new Date(building.repairFinishedAt).getTime() > now
    )
      return 'repair';
    return 'idle';
  }

  getActionTimeLeft(building: BuildingData): number {
    if (!building) return 0;
    let targetDate: Date | string | undefined | null;
    const state = this.getActionState(building);
    switch (state) {
      case 'construction':
        targetDate = building.constructionFinishedAt;
        break;
      case 'upgrade':
        targetDate = building.upgradeFinishedAt;
        break;
      case 'repair':
        targetDate = building.repairFinishedAt;
        break;
      default:
        return 0;
    }
    if (!targetDate) return 0;
    const end = new Date(targetDate).getTime();
    return Math.max(0, Math.ceil((end - this.now) / 1000));
  }

  repairBuilding(): void {
    if (!this.isOwnVillage) return;
    if (this.selectedBuildingRow === null || this.selectedBuildingCol === null)
      return;
    const building =
      this.buildings[this.selectedBuildingRow][this.selectedBuildingCol];
    if (!building || !building.id) return;
    this.webSocketService.send(WebSocketEvent.BUILDING_REPAIR, {
      buildingId: building.id,
      serverId: this.serverService.getServer()?.id ?? -1,
    });
    this.closePopup();
  }

  ngOnDestroy(): void {
    if (this.isOwnVillage) this.gatheringService.stop();
    if (this.villageDataSub) this.villageDataSub.unsubscribe();
    if (this.villageErrorSub) this.villageErrorSub.unsubscribe();
    if (this.buildingFinishedSub) this.buildingFinishedSub.unsubscribe();
    if (this.buildingUpdateSub) this.buildingUpdateSub.unsubscribe();
    if (this.battleUpdateSub) this.battleUpdateSub.unsubscribe();
    if (this.battleEndedSub) this.battleEndedSub.unsubscribe();
    if (this.battleErrorSub) this.battleErrorSub.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
