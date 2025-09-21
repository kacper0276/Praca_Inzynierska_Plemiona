import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { GatheringService } from '../../../../shared/services/gathering.service';
import { ResourceService } from '../../../../shared/services/resource.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Resources } from '../../../../shared/models/resources.model';
import { BuildingData, RadialMenuOption } from '../../../../shared/models';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit, OnDestroy {
  gridSize: number = 5;
  buildings: (BuildingData | null)[][] = [];
  readonly expansionCost = { wood: 50, clay: 30, iron: 20 };
  readonly maxGridSize = 11;
  expansionMultiplier: number = 1;

  pendingExpansion: {
    side: 'left' | 'right';
    cost: Partial<Resources>;
  } | null = null;

  draggedBuilding: { row: number; col: number } | null = null;

  selectedBuilding: BuildingData | null = null;
  selectedBuildingRow: number | null = null;
  selectedBuildingCol: number | null = null;

  resources: Resources;
  availableBuildings: BuildingData[] = [
    { id: 4, name: 'Farma', level: 1, imageUrl: 'assets/images/farm.png' },
    { id: 5, name: 'Kuźnia', level: 1, imageUrl: 'assets/images/forge.png' },
  ];
  buildMode: boolean = false;
  buildRow: number | null = null;
  buildCol: number | null = null;
  activeRadial: { row: number; col: number } | null = null;
  activeEmptyRadial: { row: number; col: number } | null = null;

  emptyPlotOptions: RadialMenuOption[] = [
    {
      action: 'build',
      iconUrl: 'assets/images/build-icon.png',
      tooltip: 'Zbuduj nowy budynek',
    },
    {
      action: 'inspect',
      iconUrl: 'assets/images/inspect-icon.png',
      tooltip: 'Informacje o polu',
    },
  ];
  buildingOptions: RadialMenuOption[] = [
    {
      action: 'details',
      iconUrl: 'assets/icons/info.svg',
      tooltip: 'Szczegóły',
    },
    {
      action: 'upgrade',
      iconUrl: 'assets/icons/upgrade.svg',
      tooltip: 'Rozbuduj',
    },
    { action: 'destroy', iconUrl: 'assets/icons/trash.svg', tooltip: 'Usuń' },
    { action: 'edit', iconUrl: 'assets/icons/edit.svg', tooltip: 'Edytuj' },
  ];

  constructor(
    private resourceService: ResourceService,
    private elementRef: ElementRef,
    private gatheringService: GatheringService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.resources = {
      wood: 0,
      clay: 0,
      iron: 0,
      population: 0,
      maxPopulation: 0,
    };
  }
  gatherSecondsLeft: number = 0;
  private _gatherSub: Subscription | null = null;

  canAfford(cost: Partial<Resources>): boolean {
    const svc: any = this.resourceService as any;
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
    this.loadPlayerBuildings();
    this.resourceService.resources$.subscribe((res) => {
      this.resources = res;
    });
    // start gathering loop
    this.gatheringService.start(() => this.buildings);
    this._gatherSub = this.gatheringService.timeLeft$.subscribe(
      (s) => (this.gatherSecondsLeft = s)
    );
  }

  ngOnDestroy(): void {
    this.gatheringService.stop();
    if (this._gatherSub) {
      this._gatherSub.unsubscribe();
      this._gatherSub = null;
    }
  }

  handleMenuOption(action: string, row: number, col: number): void {
    switch (action) {
      case 'build':
        this.buildRow = row;
        this.buildCol = col;
        this.buildMode = true;
        break;
      case 'inspect':
        this.toastr.info(this.translate.instant('INFO_FIELD', { row, col }));
        break;
      default:
        console.warn('Nieznana akcja:', action);
    }
  }

  handleBuildingMenuOption(action: string, row: number, col: number): void {
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
    this.buildings = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(null));
  }

  loadPlayerBuildings() {
    // Mock data (normal from API)
    this.buildings[1][1] = {
      id: 1,
      name: 'Ratusz',
      level: 3,
      imageUrl: 'assets/images/town_hall.png',
      maxHealth: 150,
      health: 150,
    };
    this.buildings[2][3] = {
      id: 2,
      name: 'Koszary',
      level: 1,
      imageUrl: 'assets/images/barracks.png',
      maxHealth: 80,
      health: 80,
    };
    this.buildings[3][1] = {
      id: 3,
      name: 'Spichlerz',
      level: 5,
      imageUrl: 'assets/images/storage.png',
      maxHealth: 250,
      health: 200,
    };
  }

  getBuildingData(row: number, col: number): BuildingData {
    return (
      this.buildings[row][col] || {
        id: 0,
        name: 'Pusty plac',
        level: 0,
        imageUrl: 'assets/images/empty_plot.png',
      }
    );
  }

  onDragStart(row: number, col: number): void {
    if (this.buildings[row][col]) {
      this.draggedBuilding = { row, col };
    }
  }

  onDragEnter(event: DragEvent, row: number, col: number): void {
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
    event.preventDefault();
  }

  onDrop(event: DragEvent, row: number, col: number): void {
    event.preventDefault();
    if (!this.draggedBuilding) {
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
    if (this.selectedBuildingRow === null || this.selectedBuildingCol === null)
      return;
    this.demolishBuilding(this.selectedBuildingRow, this.selectedBuildingCol);
  }

  onEmptyPlotClick(row: number, col: number): void {
    this.buildMode = true;
    this.buildRow = row;
    this.buildCol = col;
  }

  expandLeft(): void {
    if (this.gridSize >= this.maxGridSize) {
      this.toastr.error(this.translate.instant('MAX_GRID'));
      return;
    }

    const cost = this.getCurrentExpansionCost();
    if (!this.resourceService.spendResources(cost)) {
      this.toastr.error(this.translate.instant('NOT_ENOUGH_RES_EXPAND'));
      return;
    }

    this.buildings = this.buildings.map((row) => [null, ...row]);
    this.gridSize = this.gridSize + 1;
    this.expansionMultiplier += 0.5;
  }

  expandRight(): void {
    if (this.gridSize >= this.maxGridSize) {
      this.toastr.error(this.translate.instant('MAX_GRID'));
      return;
    }

    const cost = this.getCurrentExpansionCost();
    if (!this.resourceService.spendResources(cost)) {
      this.toastr.error(this.translate.instant('NOT_ENOUGH_RES_EXPAND'));
      return;
    }

    this.buildings = this.buildings.map((row) => [...row, null]);
    this.gridSize = this.gridSize + 1;
    this.expansionMultiplier += 0.5; // increase future costs
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

  requestExpansion(side: 'left' | 'right') {
    if (this.gridSize >= this.maxGridSize) {
      this.toastr.error(this.translate.instant('MAX_GRID'));
      return;
    }
    this.pendingExpansion = { side, cost: this.getCurrentExpansionCost() };
  }

  confirmExpansion() {
    if (!this.pendingExpansion) return;
    const { side, cost } = this.pendingExpansion;
    this.pendingExpansion = null;
    if (side === 'left') this.expandLeft();
    else this.expandRight();
  }

  cancelExpansion() {
    this.pendingExpansion = null;
  }

  buildBuilding(building: BuildingData, cost: Partial<Resources>): void {
    if (this.buildRow === null || this.buildCol === null) return;
    if (this.resourceService.spendResources(cost)) {
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
      this.toastr.error(this.translate.instant('NOT_ENOUGH_RES'));
    }
  }

  demolishBuilding(row: number, col: number): void {
    this.buildings[row][col] = null;
    this.closePopup();
  }

  upgradeBuilding(event: { cost: Partial<Resources> }) {
    if (this.selectedBuildingRow === null || this.selectedBuildingCol === null)
      return;
    if (this.resourceService.spendResources(event.cost)) {
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
      this.toastr.error(this.translate.instant('NOT_ENOUGH_RES_UPGRADE'));
    }
  }
}
