import { Component, OnInit } from '@angular/core';
import { RewardDisplay } from '@modules/game/interfaces';
import { QuestsService, ServerService } from '@modules/game/services';
import {
  UserQuestProgress,
  Quest,
  UserObjectiveProgress,
} from '@shared/models';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  userQuests: UserQuestProgress[] = [];

  constructor(
    private readonly serverService: ServerService,
    private readonly questsService: QuestsService
  ) {}

  ngOnInit(): void {
    this.fetchTasks();
  }

  private fetchTasks() {
    const server = this.serverService.getServer();

    if (server && server.id) {
      this.questsService.getTasksForServer(server.id).subscribe({
        next: (res) => {
          console.log(res.data);
          this.userQuests = res.data;
        },
      });
    }
  }

  getQuestRewards(quest: Quest): RewardDisplay[] {
    const rewards: RewardDisplay[] = [];
    if (quest.woodReward > 0)
      rewards.push({
        label: 'Drewno',
        amount: quest.woodReward,
        icon: 'forest',
      });
    if (quest.clayReward > 0)
      rewards.push({
        label: 'Glina',
        amount: quest.clayReward,
        icon: 'layers',
      });
    if (quest.ironReward > 0)
      rewards.push({
        label: 'Żelazo',
        amount: quest.ironReward,
        icon: 'handyman',
      });
    if (quest.populationReward > 0)
      rewards.push({
        label: 'Ludzie',
        amount: quest.populationReward,
        icon: 'group',
      });
    return rewards;
  }

  calculateObjectiveProgress(objProg: UserObjectiveProgress): number {
    return (objProg.currentCount / objProg.objective.goalCount) * 100;
  }

  claimReward(progressId: number): void {
    const questProg = this.userQuests.find((q) => q.id === progressId);
    if (questProg && questProg.isCompleted) {
      questProg.completedAt = new Date().toISOString();
    }
  }
}
