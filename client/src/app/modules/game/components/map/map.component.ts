import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MapTile } from '@modules/game/interfaces/map-tile.interface';
import { MapVillage } from '@modules/game/interfaces/map-village.interface';
import { VillagesService } from '@modules/game/services/villages.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  tiles: MapTile[][] = [];
  viewX = 0;
  viewY = 0;
  gridSize = 7;
  serverId = 1;

  constructor(
    private villagesService: VillagesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchMapData();
  }

  fetchMapData() {
    this.villagesService
      .getMapData(this.serverId, this.viewX, this.viewY, this.gridSize)
      .subscribe((villages) => {
        this.generateGrid(villages.data);
      });
  }

  generateGrid(foundVillages: MapVillage[]) {
    const half = Math.floor(this.gridSize / 2);
    const startX = this.viewX - half;
    const startY = this.viewY - half;

    const newTiles: MapTile[][] = [];

    for (let row = 0; row < this.gridSize; row++) {
      const rowData: MapTile[] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const currentX = startX + col;
        const currentY = startY + row;

        const village = foundVillages.find(
          (v) => v.x === currentX && v.y === currentY
        );

        rowData.push({
          x: currentX,
          y: currentY,
          village: village,
        });
      }
      newTiles.push(rowData);
    }
    this.tiles = newTiles;
  }

  move(dx: number, dy: number) {
    this.viewX += dx;
    this.viewY += dy;
    this.fetchMapData();
  }

  goToVillage(email: string) {
    this.router.navigate(['/game/village', email]);
  }
}
