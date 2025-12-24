import { BaseRepository } from '@core/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Quest } from '../entities/quest.entity';

@Injectable()
export class QuestsRepository extends BaseRepository<Quest> {
  constructor(
    @InjectRepository(Quest) private readonly repository: Repository<Quest>,
  ) {
    super();
  }

  findAll(options?: any): Promise<Quest[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<Quest>, options?: any): Promise<Quest> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<Quest> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(data: Partial<Quest> | DeepPartial<Quest>): Quest {
    return this.repository.create(data);
  }

  update(id: number, data: Partial<Quest>): Promise<Quest> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    this.repository.delete({ id });
  }

  save(data: Partial<Quest>): Promise<Quest> {
    return this.repository.save(data);
  }

  findAllWithObjectives(): Promise<Quest[]> {
    return this.repository.find({ relations: ['objectives'] });
  }

  findOneWithObjectives(id: number): Promise<Quest | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['objectives'],
    });
  }
}
