import { Component, OnInit } from '@angular/core';
import { QuestsService } from '@modules/game/services';
import { ActionEvent, ColumnDefinition } from '@shared/interfaces';
import { Quest } from '@shared/models';
import { ConfirmationService, ToastrService } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-quest-panel',
  templateUrl: './quest-panel.component.html',
  styleUrl: './quest-panel.component.scss',
})
export class QuestPanelComponent implements OnInit {
  questsList: Quest[] = [];
  questColumns: ColumnDefinition[] = [];

  isEditModalOpen = false;
  isCreateModalOpen = false;
  selectedQuest: Quest | null = null;

  constructor(
    private readonly questsService: QuestsService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initColumns();
    this.loadQuests();
  }

  private initColumns(): void {
    this.questColumns = [
      {
        key: 'title',
        header: this.translate.instant('admin.quests.TITLE'),
        type: 'text',
      },
      {
        key: 'description',
        header: this.translate.instant('admin.quests.DESCRIPTION'),
        type: 'text',
      },
      {
        key: 'woodReward',
        header: this.translate.instant('admin.quests.REWARD_WOOD'),
        type: 'number',
      },
      {
        key: 'clayReward',
        header: this.translate.instant('admin.quests.REWARD_CLAY'),
        type: 'number',
      },
      {
        key: 'ironReward',
        header: this.translate.instant('admin.quests.REWARD_IRON'),
        type: 'number',
      },
      {
        key: 'populationReward',
        header: this.translate.instant('admin.quests.REWARD_POPULATION'),
        type: 'number',
      },
    ];
  }

  loadQuests(): void {
    this.questsService.getAllQuests().subscribe({
      next: (response) => {
        this.questsList = response.data || [];
      },
      error: (err) =>
        this.toastr.showError(
          this.translate.instant('admin.quests.ERRORS.LOAD')
        ),
    });
  }

  handleQuestAction(event: ActionEvent): void {
    if (event.action === 'edit') {
      this.selectedQuest = event.item as Quest;
      this.isEditModalOpen = true;
    } else if (event.action === 'delete') {
      this.onDeleteQuest(event.item as Quest);
    }
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeModals(): void {
    this.isEditModalOpen = false;
    this.isCreateModalOpen = false;
    this.selectedQuest = null;
  }

  onCreateQuest(newQuest: Quest): void {
    this.questsService.createQuest(newQuest).subscribe({
      next: () => {
        this.loadQuests();
        this.closeModals();
      },
      error: (err) =>
        this.toastr.showError(
          this.translate.instant('admin.quests.ERRORS.CREATE')
        ),
    });
  }

  onSaveQuest(updatedQuest: Quest): void {
    if (this.selectedQuest?.id) {
      this.questsService
        .updateQuest(this.selectedQuest.id, updatedQuest)
        .subscribe({
          next: () => {
            this.loadQuests();
            this.closeModals();
          },
          error: (err) =>
            this.toastr.showError(
              this.translate.instant('admin.quests.ERRORS.EDIT')
            ),
        });
    }
  }

  async onDeleteQuest(quest: Quest): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      this.translate.instant('admin.quests.DELETE_CONFIRM')
    );

    if (confirmed && quest.id) {
      this.questsService.deleteQuest(quest.id).subscribe({
        next: () => {
          this.loadQuests();
        },
        error: (err) =>
          this.toastr.showError(
            this.translate.instant('admin.quests.ERRORS.DELETE')
          ),
      });
    }
  }
}
