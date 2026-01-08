import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MapTile, MapVillage } from '@modules/game/interfaces';
import { ServerService, VillagesService } from '@modules/game/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  tiles: MapTile[][] = [];
  viewX = 0;
  viewY = 0;
  gridSize = 7;

  constructor(
    private readonly villagesService: VillagesService,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
    private readonly serverService: ServerService
  ) {}

  ngOnInit() {
    this.fetchMapData();
  }

  fetchMapData() {
    const server = this.serverService.getServer();

    if (server && server.id) {
      this.villagesService
        .getMapData(server.id, this.viewX, this.viewY, this.gridSize)
        .subscribe({
          next: (villages) => {
            this.generateGrid(villages.data);
          },
          error: () => {
            this.toastr.showError(
              this.translate.instant('map.ERRORS.FETCH_FAILED')
            );
          },
        });
    }
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
