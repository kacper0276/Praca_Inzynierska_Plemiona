import { Component, OnInit } from '@angular/core';
import { BuildingData } from '../../../../shared/models';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
})
export class GridComponent implements OnInit {
  gridSize: number = 5;
  buildings: (BuildingData | null)[][] = [];

  draggedBuilding: { row: number; col: number } | null = null;

  selectedBuilding: BuildingData | null = null;

  ngOnInit(): void {
    this.initializeGrid();
    this.loadPlayerBuildings();
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
      this.selectedBuilding = building;
    }
  }
  closePopup(): void {
    this.selectedBuilding = null;
  }
}
