import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ResourceService } from '../../../../shared/services/resource.service';
import { Resources } from '../../../../shared/models/resources.model';
import { BuildingData, RadialMenuOption } from '../../../../shared/models';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit {
  gridSize: number = 5;
  buildings: (BuildingData | null)[][] = [];

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
    private elementRef: ElementRef
  ) {
    this.resources = {
      wood: 0,
      clay: 0,
      iron: 0,
      population: 0,
      maxPopulation: 0,
    };
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
  }

  handleMenuOption(action: string, row: number, col: number): void {
    switch (action) {
      case 'build':
        this.buildRow = row;
        this.buildCol = col;
        this.buildMode = true;
        break;
      case 'inspect':
        alert(`Informacje o polu [${row}, ${col}]`);
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
    };
    this.buildings[2][3] = {
      id: 2,
      name: 'Koszary',
      level: 1,
      imageUrl: 'assets/images/barracks.png',
    };
    this.buildings[3][1] = {
      id: 3,
      name: 'Spichlerz',
      level: 5,
      imageUrl: 'assets/images/storage.png',
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

  buildBuilding(building: BuildingData, cost: Partial<Resources>): void {
    if (this.buildRow === null || this.buildCol === null) return;
    if (this.resourceService.spendResources(cost)) {
      this.buildings[this.buildRow][this.buildCol] = { ...building };
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
      alert('Za mało surowców!');
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
      }
    } else {
      alert('Za mało surowców na rozbudowę!');
    }
  }
}
