import { Repository } from 'typeorm';
import { Village } from '../entities/village.entity';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@core/repositories/base.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VillagesRepository extends BaseRepository<Village> {
  constructor(
    @InjectRepository(Village)
    private readonly repository: Repository<Village>,
  ) {
    super();
  }

  findAll(options?: any): Promise<Village[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<Village>, options?: any): Promise<Village | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<Village | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  findByUserId(userId: number): Promise<Village | null> {
    return this.repository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });
  }

  create(entity: Partial<Village>): Village {
    return this.repository.create(entity);
  }

  save(entity: Village): Promise<Village> {
    return this.repository.save(entity);
  }

  update(id: number, entity: Partial<Village>): Promise<Village> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
