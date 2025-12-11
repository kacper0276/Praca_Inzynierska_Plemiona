import { Component, OnInit } from '@angular/core';
import { BuildingsService } from '@modules/game/services/buildings.service';
import { ColumnDefinition } from '@shared/interfaces/column-definition.interface';
import { BuildingData } from '@shared/models';

@Component({
  selector: 'app-building-panel',
  templateUrl: './building-panel.component.html',
  styleUrl: './building-panel.component.scss',
})
export class BuildingPanelComponent implements OnInit {
  buildingsList: BuildingData[] = [];
  buildingColumns: ColumnDefinition[] = [
    {
      key: 'name',
      header: 'Nazwa budynku',
    },
    {
      key: 'level',
      header: 'Poziom budynku',
    },
    {
      key: 'health',
      header: 'Poziom zdrowia',
    },
    {
      key: 'userLogin',
      header: 'Nazwa użytkownika',
    },
    {
      key: 'userVillageId',
      header: 'Id wioski użytkownika',
    },
  ];
  isModalOpen: boolean = false;
  selectedBuilding: BuildingData | null = null;

  constructor(private readonly buildingsService: BuildingsService) {}

  ngOnInit(): void {
    this.fetchAllBuildings();
  }

  private fetchAllBuildings() {
    this.buildingsService.getAllBuildings().subscribe({
      next: (res) => {
        console.log(res);
        this.buildingsList = res.data;
      },
    });
  }
}
