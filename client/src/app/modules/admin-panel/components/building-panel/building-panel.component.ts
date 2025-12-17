import { Component, OnInit } from '@angular/core';
import { BuildingsService } from '@modules/game/services';
import { ColumnDefinition, ActionEvent } from '@shared/interfaces';
import { BuildingData } from '@shared/models';
import { ConfirmationService } from '@shared/services';

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
      isReadOnly: true,
    },
    {
      key: 'userVillageId',
      header: 'Id wioski użytkownika',
      isReadOnly: true,
    },
  ];
  isModalOpen: boolean = false;
  selectedBuilding: BuildingData | null = null;

  constructor(
    private readonly buildingsService: BuildingsService,
    private readonly confirmationService: ConfirmationService
  ) {}

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

  handleBuildingAction(event: ActionEvent): void {
    this.selectedBuilding = event.item as BuildingData;
    this.isModalOpen = true;
  }

  closeEditModal(): void {
    this.isModalOpen = false;
    this.selectedBuilding = null;
  }

  onSaveBuilding(updatedBuilding: BuildingData): void {
    const index = this.buildingsList.findIndex(
      (b) => b.id === updatedBuilding.id
    );

    if (index > -1) {
      this.buildingsList[index] = updatedBuilding;
    }
    this.closeEditModal();
  }

  async onDeleteBuilding(buildingToDelete: BuildingData): Promise<void> {
    const result = await this.confirmationService.confirm(
      `Czy na pewno chcesz usunąć ten budynek?`
    );

    if (result) {
      this.buildingsList = this.buildingsList.filter(
        (b) => b.id !== buildingToDelete.id
      );
      this.closeEditModal();
    } else {
      console.log('anulowano');
    }
  }
}
