import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '@modules/game/services/resources.service';
import { ActionEvent } from '@shared/interfaces/action-event.interface';
import { ColumnDefinition } from '@shared/interfaces/column-definition.interface';
import { Resources } from '@shared/models';
import { ConfirmationService } from '@shared/services/confirmation.service';

@Component({
  selector: 'app-resource-panel',
  templateUrl: './resource-panel.component.html',
  styleUrl: './resource-panel.component.scss',
})
export class ResourcePanelComponent implements OnInit {
  resourcesList: Resources[] = [];
  resourceColumns: ColumnDefinition[] = [
    {
      key: 'wood',
      header: 'Drewno',
    },
    {
      key: 'clay',
      header: 'Glina',
    },
    {
      key: 'iron',
      header: 'Żelazo',
    },
    {
      key: 'population',
      header: 'Ilość ludzi',
    },
    {
      key: 'maxPopulation',
      header: 'Maksymalna liczba ludzi',
    },
  ];
  isModalOpen: boolean = false;
  selectedResource: Resources | null = null;

  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.fetchAllResources();
  }

  private fetchAllResources(): void {
    this.resourcesService.fetchAllResources().subscribe({
      next: (res) => {
        this.resourcesList = res.data;
      },
    });
  }

  handleResourceAction(event: ActionEvent): void {
    this.selectedResource = event.item as Resources;
    this.isModalOpen = true;
  }

  closeEditModal(): void {
    this.isModalOpen = false;
    this.selectedResource = null;
  }

  onSaveResource(updateResources: Resources): void {}

  onDeleteResource(resourceToDelete: Resources): void {}
}
