import { BaseRepository } from '@core/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserObjectiveProgress } from '../entities/user-objective-progress.entity';

@Injectable()
export class UserObjectiveProgressRepository extends BaseRepository<UserObjectiveProgress> {
  constructor(
    @InjectRepository(UserObjectiveProgress)
    private readonly repository: Repository<UserObjectiveProgress>,
  ) {
    super();
  }

  findAll(options?: any): Promise<UserObjectiveProgress[]> {
    return this.repository.find(options);
  }

  findOne(
    where: Partial<UserObjectiveProgress>,
    options?: any,
  ): Promise<UserObjectiveProgress> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<UserObjectiveProgress> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(data: Partial<UserObjectiveProgress>): UserObjectiveProgress {
    return this.repository.create(data);
  }

  update(
    id: number,
    data: Partial<UserObjectiveProgress>,
  ): Promise<UserObjectiveProgress> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    this.repository.delete({ id });
  }

  save(data: Partial<UserObjectiveProgress>): Promise<UserObjectiveProgress> {
    return this.repository.save(data);
  }
}
