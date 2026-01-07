import { BaseRepository } from '@core/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQuestProgress } from '../entities/user-quest-progress.entity';

@Injectable()
export class UserQuestProgressRepository extends BaseRepository<UserQuestProgress> {
  constructor(
    @InjectRepository(UserQuestProgress)
    private readonly repository: Repository<UserQuestProgress>,
  ) {
    super();
  }

  async findActiveQuests(userId: number, serverId: number) {
    return this.repository.find({
      where: {
        user: { id: userId } as any,
        server: { id: serverId } as any,
        isCompleted: false,
      },
      relations: [
        'objectivesProgress',
        'objectivesProgress.objective',
        'quest',
      ],
    });
  }

  findAll(options?: any): Promise<UserQuestProgress[]> {
    return this.repository.find(options);
  }

  findOne(
    where: Partial<UserQuestProgress>,
    options?: any,
  ): Promise<UserQuestProgress> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<UserQuestProgress> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(data: Partial<UserQuestProgress>): UserQuestProgress {
    return this.repository.create(data);
  }

  update(
    id: number,
    data: Partial<UserQuestProgress>,
  ): Promise<UserQuestProgress> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    this.repository.delete({ id });
  }

  save(data: Partial<UserQuestProgress>): Promise<UserQuestProgress> {
    return this.repository.save(data);
  }

  async findProgress(userId: number, serverId: number, questId: number) {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        server: { id: serverId },
        quest: { id: questId },
      },
      relations: [
        'objectivesProgress',
        'objectivesProgress.objective',
        'quest',
      ],
    });
  }

  async findUserQuestsOnServer(userId: number, serverId: number) {
    return this.repository.find({
      where: { user: { id: userId }, server: { id: serverId } },
      relations: [
        'quest',
        'objectivesProgress',
        'objectivesProgress.objective',
      ],
    });
  }
}
