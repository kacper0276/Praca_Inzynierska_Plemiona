import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ResourcesService } from '../../services/resources.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { GatheringService } from '../../services/gathering.service';
import { UserService } from '../../../auth/services/user.service';
import { availableBuildings } from '@shared/consts/available-buildings';
import { WebSocketEvent } from '@shared/enums';
import { BuildingData, Resources, RadialMenuOption } from '@shared/models';
import { ToastrService } from '@shared/services/toastr.service';
import { WebSocketService } from '@shared/services/web-socket.service';
import {
  BUILDING_OPTIONS,
  EMPTY_PLOT_OPTIONS,
} from '@shared/consts/radial-menu.options';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit, OnDestroy {
  Math = Math;
  gridWidth: number = 7;
  readonly gridHeight: number = 5;
  buildings: (BuildingData | null)[][] = [];
  readonly expansionCost = { wood: 50, clay: 30, iron: 20 };
  readonly maxGridSize = 11;
  expansionMultiplier: number = 1;
  userEmail: string | null = null;

  isOwnVillage: boolean = true;

  isAttacking = false;
  private battleInterval: any = null;
  private villageDataSub: Subscription | undefined;
  private villageErrorSub: Subscription | undefined;

  attackingArmy = {
    totalHp: 0,
    maxHp: 0,
    damage: 0,
    gifUrl: 'assets/images/attacking-army.gif',
    x: 50,
    y: window.innerHeight - 150,
    state: 'idle',
    targetX: 0,
    targetY: 0,
  };

  defendingArmy = {
    totalHp: 0,
    maxHp: 0,
    damage: 0,
    gifUrl: 'assets/images/defending-army.gif',
    x: window.innerWidth - 150,
    y: 100,
    state: 'idle',
    targetX: 0,
    targetY: 0,
  };

  attackTarget: { row: number; col: number } | null = null;
  explosion = {
    gifUrl: 'assets/images/explosion.gif',
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

  availableBuildings: BuildingData[] = availableBuildings;

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
    private readonly usersService: UserService
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
    if (typeof svc.canAfford === 'function') {
      return svc.canAfford(cost);
    }

    const r = this.resources || { wood: 0, clay: 0, iron: 0 };
    return (
      (cost.wood || 0) <= (r.wood || 0) &&
      (cost.clay || 0) <= (r.clay || 0) &&
      (cost.iron || 0) <= (r.iron || 0)
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.activeRadial) {
      return;
    }

    const clickedElement = event.target as HTMLElement;
    const activeCellElement = this.elementRef.nativeElement.querySelector(
      `.grid-row:nth-child(${this.activeRadial.row + 1}) 
       .grid-cell:nth-child(${this.activeRadial.col + 1})`
    );

    if (activeCellElement && !activeCellElement.contains(clickedElement)) {
      this.activeRadial = null;
    }
  }

  ngOnInit(): void {
    this.initializeGrid();
    this.setupVillageDataListeners();

    if (this.isOwnVillage) {
      this.resourcesService.resources$.subscribe((res) => {
        this.resources = res;
      });
      this.gatheringService.start(1000 * 10);
    }
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
          this.toastr.showError(`Błąd ładowania wioski: ${error.message}`);
        });

      this.webSocketService.requestVillageData();
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
            `Błąd ładowania wioski gracza: ${error.message}`
          );
        });

      this.webSocketService.requestVillageByEmail(this.userEmail);
    }
  }

  handleMenuOption(action: string, row: number, col: number): void {
    if (!this.isOwnVillage && action !== 'inspect') return;

    switch (action) {
      case 'build':
        this.buildRow = row;
        this.buildCol = col;
        this.buildMode = true;
        break;
      case 'inspect':
        this.toastr.showInfo(
          this.translate.instant('INFO_FIELD', { row, col })
        );
        break;
      default:
        console.warn('Nieznana akcja:', action);
    }
  }

  handleBuildingMenuOption(action: string, row: number, col: number): void {
    if (!this.isOwnVillage && action !== 'details') return;
    this.activeRadial = null;

    switch (action) {
      case 'details':
        this.selectedBuilding = this.buildings[row][col];
        this.selectedBuildingRow = row;
        this.selectedBuildingCol = col;
        break;
      case 'upgrade':
        this.selectedBuilding = this.buildings[row][col];
        this.selectedBuildingRow = row;
        this.selectedBuildingCol = col;
        break;
      case 'destroy':
        this.demolishBuilding(row, col);
        break;
      case 'edit':
        break;
    }
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
    });
  }

  private findNextTarget(move: boolean = true): boolean {
    for (let i = 0; i < this.gridHeight; i++) {
      for (let j = 0; j < this.gridWidth; j++) {
        if (this.buildings[i][j]) {
          this.attackTarget = { row: i, col: j };
          if (move) {
            const targetCoords = this.getTargetBuildingCoords(i, j);
            this.attackingArmy.targetX = targetCoords.x;
            this.attackingArmy.targetY = targetCoords.y;
            this.attackingArmy.state = 'marching';
          }
          return true;
        }
      }
    }
    this.attackTarget = null;
    return false;
  }

  getBuildingData(row: number, col: number): BuildingData {
    return (
      this.buildings[row][col] || {
        id: 0,
        name: 'Pusty plac',
        level: 0,
        imageUrl: 'assets/img/background_playground.png',
      }
    );
  }

  onDragStart(row: number, col: number): void {
    if (!this.isOwnVillage) return;
    if (this.buildings[row][col]) {
      this.draggedBuilding = { row, col };
    }
  }

  onDragEnter(event: DragEvent, row: number, col: number): void {
    if (!this.isOwnVillage) return;
    if (this.draggedBuilding) {
      const targetElement = event.target as HTMLElement;
      const cell = targetElement.closest('.grid-cell');
      if (cell) {
        cell.classList.add('drag-over-active');
      }
    }
  }

  onDragLeave(event: DragEvent): void {
    const targetElement = event.target as HTMLElement;
    const cell = targetElement.closest('.grid-cell');
    if (cell) {
      cell.classList.remove('drag-over-active');
    }
  }

  onDragOver(event: DragEvent): void {
    if (!this.isOwnVillage) return;
    event.preventDefault();
  }

  onDrop(event: DragEvent, row: number, col: number): void {
    event.preventDefault();
    if (!this.isOwnVillage || !this.draggedBuilding) {
      return;
    }

    const fromRow = this.draggedBuilding.row;
    const fromCol = this.draggedBuilding.col;

    if (fromRow === row && fromCol === col) {
      this.cleanupDragState(event);
      return;
    }

    const draggedData = this.buildings[fromRow][fromCol];
    const targetData = this.buildings[row][col];

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
    document.querySelectorAll('.drag-over-active').forEach((el) => {
      el.classList.remove('drag-over-active');
    });
  }

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
    if (this.resourcesService.spendResources(event.cost)) {
      const building =
        this.buildings[this.selectedBuildingRow][this.selectedBuildingCol];
      if (building) {
        building.level = (building.level || 1) + 1;
        building.maxHealth = (building.maxHealth || 100) + 10;
        building.health = Math.min(
          building.health ? building.health + 10 : building.maxHealth,
          building.maxHealth
        );
      }
    } else {
      this.toastr.showError(this.translate.instant('NOT_ENOUGH_RES_UPGRADE'));
    }
  }

  startAttack(): void {
    if (this.isAttacking || this.isOwnVillage) return;
    this.isAttacking = true;

    this.attackingArmy.maxHp = 1000;
    this.attackingArmy.totalHp = 1000;
    this.attackingArmy.damage = 50;
    this.attackingArmy.state = 'idle';
    this.attackingArmy.x = 50;
    this.attackingArmy.y = window.innerHeight - 150;

    this.defendingArmy.maxHp = 800;
    this.defendingArmy.totalHp = 800;
    this.defendingArmy.damage = 40;
    this.defendingArmy.state = 'marching';
    this.defendingArmy.x = window.innerWidth - 150;
    this.defendingArmy.y = 100;

    this.findNextTarget();

    this.battleInterval = setInterval(() => this.battleTick(), 100);
  }

  private battleTick(): void {
    this.moveArmy(this.attackingArmy, 5);
    this.moveArmy(this.defendingArmy, 4);

    const distance = this.calculateDistance(
      this.attackingArmy,
      this.defendingArmy
    );

    if (
      distance < 100 &&
      this.attackingArmy.totalHp > 0 &&
      this.defendingArmy.totalHp > 0
    ) {
      this.attackingArmy.state = 'fighting_army';
      this.defendingArmy.state = 'fighting_army';

      this.attackingArmy.totalHp -= this.defendingArmy.damage / 10;
      this.defendingArmy.totalHp -= this.attackingArmy.damage / 10;
    } else {
      if (this.defendingArmy.totalHp > 0) {
        this.defendingArmy.state = 'marching';
        this.defendingArmy.targetX = this.attackingArmy.x;
        this.defendingArmy.targetY = this.attackingArmy.y;
      }

      if (this.attackingArmy.state !== 'attacking_building') {
        this.attackingArmy.state = 'marching';
      }
    }

    if (
      this.attackingArmy.state === 'attacking_building' &&
      this.attackTarget
    ) {
      const building =
        this.buildings[this.attackTarget.row][this.attackTarget.col];
      if (building && building.health) {
        building.health -= this.attackingArmy.damage / 10;
        this.showExplosion(
          this.attackingArmy.targetX,
          this.attackingArmy.targetY
        );

        if (building.health <= 0) {
          this.buildings[this.attackTarget.row][this.attackTarget.col] = null;
          this.findNextTarget();
        }
      }
    }

    if (this.attackingArmy.totalHp <= 0) {
      this.endAttack('Porażka! Twoja armia została pokonana.');
    } else if (this.defendingArmy.totalHp <= 0 && !this.findNextTarget(false)) {
      this.endAttack('Zwycięstwo! Wioska została zniszczona.');
    }
  }

  private moveArmy(army: any, speed: number): void {
    if (army.state !== 'marching') return;

    const dx = army.targetX - army.x;
    const dy = army.targetY - army.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
      army.x = army.targetX;
      army.y = army.targetY;
      if (army === this.attackingArmy && this.defendingArmy.totalHp <= 0) {
        army.state = 'attacking_building';
      }
    } else {
      army.x += (dx / distance) * speed;
      army.y += (dy / distance) * speed;
    }
  }

  private getTargetBuildingCoords(
    row: number,
    col: number
  ): { x: number; y: number } {
    const cellElement = this.elementRef.nativeElement.querySelector(
      `.grid-row:nth-child(${row + 1}) .grid-cell:nth-child(${col + 1})`
    );
    if (cellElement) {
      const rect = cellElement.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX + rect.width / 2 - 50,
        y: rect.top + window.scrollY + rect.height / 2 - 50,
      };
    }
    return { x: 0, y: 0 };
  }

  private showExplosion(x: number, y: number): void {
    this.explosion.x = x;
    this.explosion.y = y;
    this.explosion.show = true;
    setTimeout(() => (this.explosion.show = false), 500);
  }

  private calculateDistance(entity1: any, entity2: any): number {
    const dx = entity1.x - entity2.x;
    const dy = entity1.y - entity2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private endAttack(message: string): void {
    clearInterval(this.battleInterval);
    this.isAttacking = false;
    this.toastr.showInfo(message);
  }

  ngOnDestroy(): void {
    if (this.isOwnVillage) {
      this.gatheringService.stop();
    }
    if (this.villageDataSub) {
      this.villageDataSub.unsubscribe();
    }
    if (this.villageErrorSub) {
      this.villageErrorSub.unsubscribe();
    }
    if (this.battleInterval) {
      clearInterval(this.battleInterval);
    }
  }
}
