import { BaseRepository } from '@core/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestObjective } from '../entities/quest-objective.entity';

@Injectable()
export class QuestObjectivesRepository extends BaseRepository<QuestObjective> {
  constructor(
    @InjectRepository(QuestObjective)
    private readonly repository: Repository<QuestObjective>,
  ) {
    super();
  }

  findAll(options?: any): Promise<QuestObjective[]> {
    return this.repository.find(options);
  }

  findOne(
    where: Partial<QuestObjective>,
    options?: any,
  ): Promise<QuestObjective> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<QuestObjective> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(data: Partial<QuestObjective>): QuestObjective {
    return this.repository.create(data);
  }

  update(id: number, data: Partial<QuestObjective>): Promise<QuestObjective> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    this.repository.delete({ id });
  }

  save(data: Partial<QuestObjective>): Promise<QuestObjective> {
    return this.repository.save(data);
  }
}
