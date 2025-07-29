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

  private draggedBuilding: {
    row: number;
    col: number;
    data: BuildingData;
  } | null = null;

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
    const buildingData = this.buildings[row][col];
    if (buildingData) {
      this.draggedBuilding = { row, col, data: buildingData };
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
      this.draggedBuilding = null;
      return;
    }

    const targetBuilding = this.buildings[row][col];
    this.buildings[row][col] = this.draggedBuilding.data;
    this.buildings[fromRow][fromCol] = targetBuilding;

    this.draggedBuilding = null;
  }

  onDragEnd(): void {
    this.draggedBuilding = null;
  }
}
