import { Repository } from 'typeorm';
import { Resources } from '../entities/resources.entity';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/repositories/base.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ResourcesRepository extends BaseRepository<Resources> {
  constructor(
    @InjectRepository(Resources)
    private readonly repository: Repository<Resources>,
  ) {
    super();
  }

  findAll(options?: any): Promise<Resources[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<Resources>, options?: any): Promise<Resources | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<Resources | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(entity: Partial<Resources>): Resources {
    return this.repository.create(entity);
  }

  save(entity: Resources): Promise<Resources> {
    return this.repository.save(entity);
  }

  update(id: number, entity: Partial<Resources>): Promise<Resources> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
