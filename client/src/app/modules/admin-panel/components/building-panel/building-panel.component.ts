import { Component, OnInit } from '@angular/core';
import { BuildingsService } from '@modules/game/services';
import { ColumnDefinition, ActionEvent } from '@shared/interfaces';
import { BuildingData } from '@shared/models';
import { ConfirmationService } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-building-panel',
  templateUrl: './building-panel.component.html',
  styleUrl: './building-panel.component.scss',
})
export class BuildingPanelComponent implements OnInit {
  buildingsList: BuildingData[] = [];
  buildingColumns: ColumnDefinition[] = [];
  isModalOpen: boolean = false;
  selectedBuilding: BuildingData | null = null;

  constructor(
    private readonly buildingsService: BuildingsService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initColumns();
    this.fetchAllBuildings();
  }

  private initColumns(): void {
    this.buildingColumns = [
      {
        key: 'name',
        header: this.translate.instant('admin.buildings.NAME'),
      },
      {
        key: 'level',
        header: this.translate.instant('admin.buildings.LEVEL'),
      },
      {
        key: 'health',
        header: this.translate.instant('admin.buildings.HEALTH'),
      },
      {
        key: 'userLogin',
        header: this.translate.instant('admin.buildings.USER_LOGIN'),
        isReadOnly: true,
      },
      {
        key: 'userVillageId',
        header: this.translate.instant('admin.buildings.VILLAGE_ID'),
        isReadOnly: true,
      },
    ];
  }

  private fetchAllBuildings() {
    this.buildingsService.getAllBuildings().subscribe({
      next: (res) => {
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
      this.translate.instant('admin.buildings.DELETE_CONFIRM')
    );

    if (result) {
      this.buildingsList = this.buildingsList.filter(
        (b) => b.id !== buildingToDelete.id
      );
      this.closeEditModal();
    }
  }
}
