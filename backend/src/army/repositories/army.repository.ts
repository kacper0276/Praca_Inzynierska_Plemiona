import { BaseRepository } from '@core/repositories/base.repository';
import { Injectable } from '@nestjs/common';
import { ArmyUnit } from '../entities/army-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ArmyRepository extends BaseRepository<ArmyUnit> {
  constructor(
    @InjectRepository(ArmyUnit)
    private readonly repository: Repository<ArmyUnit>,
  ) {
    super();
  }

  findAll(options?: any): Promise<ArmyUnit[]> {
    return this.repository.find(options);
  }

  find(options?: any): Promise<ArmyUnit[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<ArmyUnit>, options?: any): Promise<ArmyUnit | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<ArmyUnit | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(data: Partial<ArmyUnit>): ArmyUnit {
    return this.repository.create(data);
  }

  save(data: Partial<ArmyUnit>): Promise<ArmyUnit> {
    return this.repository.save(data);
  }

  update(id: number, data: Partial<ArmyUnit>): Promise<ArmyUnit> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
