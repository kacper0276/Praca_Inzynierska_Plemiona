import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourcesRepository } from 'src/resources/repositories/resources.repository';
import { UserObjectiveProgress } from '../entities/user-objective-progress.entity';
import { QuestsRepository } from '../repositories/quests.repository';
import { UserObjectiveProgressRepository } from '../repositories/user-objective-progress.repository';
import { UserQuestProgressRepository } from '../repositories/user-quest-progress.repository';
import { CreateQuestDto } from '../dto/create-quest.dto';

@Injectable()
export class QuestsService {
  constructor(
    private readonly questRepo: QuestsRepository,
    private readonly userQuestRepo: UserQuestProgressRepository,
    private readonly objectiveProgressRepo: UserObjectiveProgressRepository,
    private readonly resourcesRepo: ResourcesRepository,
  ) {}

  async createQuest(data: CreateQuestDto) {
    return this.questRepo.save(this.questRepo.create(data));
  }

  async startQuest(userId: number, serverId: number, questId: number) {
    const quest = await this.questRepo.findOneWithObjectives(questId);
    if (!quest) throw new NotFoundException('Quest nie istnieje');

    let progress = await this.userQuestRepo.findProgress(
      userId,
      serverId,
      questId,
    );
    if (progress) return progress;

    progress = this.userQuestRepo.create({
      user: { id: userId } as any,
      server: { id: serverId } as any,
      quest: quest,
    });
    const savedProgress = await this.userQuestRepo.save(progress);

    const objectivePromises = quest.objectives.map((obj) => {
      const objProg = this.objectiveProgressRepo.create({
        userQuest: savedProgress,
        objective: obj,
        currentCount: 0,
      });
      return this.objectiveProgressRepo.save(objProg);
    });

    await Promise.all(objectivePromises);
    return this.userQuestRepo.findProgress(userId, serverId, questId);
  }

  async updateObjectiveProgress(
    userId: number,
    serverId: number,
    objectiveId: number,
    amount: number,
  ) {
    const objProg = await this.objectiveProgressRepo.findOne(
      {
        objective: { id: objectiveId } as any,
        userQuest: {
          user: { id: userId } as any,
          server: { id: serverId } as any,
        } as any,
      },
      { relations: ['objective', 'userQuest', 'userQuest.quest'] },
    );

    if (!objProg || objProg.isCompleted) return;

    objProg.currentCount += amount;
    if (objProg.currentCount >= objProg.objective.goalCount) {
      objProg.isCompleted = true;
      await this.claimObjectiveReward(userId, serverId, objProg);
    }

    await this.objectiveProgressRepo.save(objProg);
    await this.checkMainQuestCompletion(objProg.userQuest.id, userId, serverId);
  }

  private async claimObjectiveReward(
    userId: number,
    serverId: number,
    objProg: UserObjectiveProgress,
  ) {
    const res = await this.resourcesRepo.findOneByUserIdAndServerId(
      userId,
      serverId,
    );
    if (!res) return;

    res.wood += objProg.objective.woodReward;
    res.clay += objProg.objective.clayReward;
    res.iron += objProg.objective.ironReward;
    await this.resourcesRepo.save(res);
    objProg.rewardClaimed = true;
  }

  private async checkMainQuestCompletion(
    uqpId: number,
    userId: number,
    serverId: number,
  ) {
    const progress = await this.userQuestRepo.findOne(
      { id: uqpId },
      { relations: ['objectivesProgress', 'quest'] },
    );

    const allDone = progress.objectivesProgress.every((op) => op.isCompleted);
    if (allDone && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await this.userQuestRepo.save(progress);

      const res = await this.resourcesRepo.findOneByUserIdAndServerId(
        userId,
        serverId,
      );
      res.wood += progress.quest.woodReward;
      res.clay += progress.quest.clayReward;
      res.iron += progress.quest.ironReward;
      res.population += progress.quest.populationReward;
      await this.resourcesRepo.save(res);
    }
  }

  async getUserQuests(userId: number, serverId: number) {
    return this.userQuestRepo.findUserQuestsOnServer(userId, serverId);
  }
}
