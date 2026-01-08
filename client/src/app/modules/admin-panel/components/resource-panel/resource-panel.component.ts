import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '@modules/game/services';
import { ColumnDefinition, ActionEvent } from '@shared/interfaces';
import { Resources } from '@shared/models';
import { ConfirmationService } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-resource-panel',
  templateUrl: './resource-panel.component.html',
  styleUrl: './resource-panel.component.scss',
})
export class ResourcePanelComponent implements OnInit {
  resourcesList: Resources[] = [];
  resourceColumns: ColumnDefinition[] = [];
  isModalOpen: boolean = false;
  selectedResource: Resources | null = null;

  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initColumns();
    this.fetchAllResources();
  }

  private initColumns(): void {
    this.resourceColumns = [
      {
        key: 'wood',
        header: this.translate.instant('admin.resources.WOOD'),
      },
      {
        key: 'clay',
        header: this.translate.instant('admin.resources.CLAY'),
      },
      {
        key: 'iron',
        header: this.translate.instant('admin.resources.IRON'),
      },
      {
        key: 'population',
        header: this.translate.instant('admin.resources.POPULATION'),
      },
      {
        key: 'maxPopulation',
        header: this.translate.instant('admin.resources.MAX_POPULATION'),
      },
    ];
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
