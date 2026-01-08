import { Component, OnInit } from '@angular/core';
import { QuestsService } from '@modules/game/services';
import { ActionEvent, ColumnDefinition } from '@shared/interfaces';
import { Quest } from '@shared/models';
import { ConfirmationService } from '@shared/services';

@Component({
  selector: 'app-quest-panel',
  templateUrl: './quest-panel.component.html',
  styleUrl: './quest-panel.component.scss',
})
export class QuestPanelComponent implements OnInit {
  questsList: Quest[] = [];
  questColumns: ColumnDefinition[] = [
    { key: 'title', header: 'Tytuł', type: 'text' },
    { key: 'description', header: 'Opis', type: 'text' },
    { key: 'woodReward', header: 'Drewno', type: 'number' },
    { key: 'clayReward', header: 'Glina', type: 'number' },
    { key: 'ironReward', header: 'Żelazo', type: 'number' },
    { key: 'populationReward', header: 'Ludność', type: 'number' },
    // { key: 'isAction', header: 'Akcje', isAction: true },
  ];

  isEditModalOpen = false;
  isCreateModalOpen = false;
  selectedQuest: Quest | null = null;

  constructor(
    private readonly questsService: QuestsService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadQuests();
  }

  loadQuests(): void {
    this.questsService.getAllQuests().subscribe({
      next: (response) => {
        this.questsList = response.data || [];
      },
      error: (err) => console.error('Błąd podczas ładowania zadań:', err),
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
    console.log(newQuest);
    this.questsService.createQuest(newQuest).subscribe({
      next: () => {
        this.loadQuests();
        this.closeModals();
      },
      error: (err) => console.error('Błąd podczas tworzenia zadania:', err),
    });
  }

  onSaveQuest(updatedQuest: Quest): void {
    if (this.selectedQuest?.id) {
      console.log(updatedQuest);
      this.questsService
        .updateQuest(this.selectedQuest.id, updatedQuest)
        .subscribe({
          next: () => {
            this.loadQuests();
            this.closeModals();
          },
          error: (err) => console.error('Błąd podczas edycji zadania:', err),
        });
    }
  }

  async onDeleteQuest(quest: Quest): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      'Czy na pewno chcesz usunąć to zadanie?'
    );

    if (confirmed && quest.id) {
      this.questsService.deleteQuest(quest.id).subscribe({
        next: () => {
          this.loadQuests();
        },
        error: (err) => console.error('Błąd podczas usuwania zadania:', err),
      });
    }
  }
}
