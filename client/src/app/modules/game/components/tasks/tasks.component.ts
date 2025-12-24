import { Component, OnInit } from '@angular/core';
import { RewardDisplay } from '@modules/game/interfaces';
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

  constructor() {}

  ngOnInit(): void {
    this.mockData();
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

  private mockData(): void {
    this.userQuests = [
      {
        id: 1,
        user: {} as any,
        server: {} as any,
        isCompleted: false,
        completedAt: null,
        quest: {
          id: 101,
          title: 'Początki Gospodarki',
          description:
            'Rozwiń wydobycie podstawowych surowców w swojej wiosce.',
          woodReward: 500,
          clayReward: 300,
          ironReward: 100,
          populationReward: 5,
          objectives: [],
        },
        objectivesProgress: [
          {
            id: 1,
            currentCount: 3,
            isCompleted: false,
            rewardClaimed: false,
            objective: {
              id: 1,
              description: 'Podnieś Tartak na poziom 5',
              goalCount: 5,
              woodReward: 0,
              clayReward: 0,
              ironReward: 0,
            },
          },
          {
            id: 2,
            currentCount: 100,
            isCompleted: true,
            rewardClaimed: true,
            objective: {
              id: 2,
              description: 'Zbierz 100 jednostek drewna',
              goalCount: 100,
              woodReward: 50,
              clayReward: 0,
              ironReward: 0,
            },
          },
        ],
      },
      {
        id: 2,
        user: {} as any,
        server: {} as any,
        isCompleted: true,
        completedAt: null,
        quest: {
          id: 102,
          title: 'Rekrutacja Armii',
          description: 'Twoja wioska potrzebuje obrońców.',
          woodReward: 0,
          clayReward: 0,
          ironReward: 200,
          populationReward: 0,
          objectives: [],
        },
        objectivesProgress: [
          {
            id: 3,
            currentCount: 10,
            isCompleted: true,
            rewardClaimed: true,
            objective: {
              id: 3,
              description: 'Wytrenuj 10 żołnierzy',
              goalCount: 10,
              woodReward: 0,
              clayReward: 0,
              ironReward: 0,
            },
          },
        ],
      },
    ];
  }
}
