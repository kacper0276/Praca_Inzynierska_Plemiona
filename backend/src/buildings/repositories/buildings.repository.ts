import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseRepository } from '@core/repositories/base.repository';
import { Building } from '../entities/building.entity';

@Injectable()
export class BuildingsRepository extends BaseRepository<Building> {
  constructor(
    @InjectRepository(Building)
    private readonly repository: Repository<Building>,
  ) {
    super();
  }

  findAll(options?: FindManyOptions<Building>): Promise<Building[]> {
    return this.repository.find(options);
  }

  findAllByVillageId(villageId: number): Promise<Building[]> {
    return this.repository.find({
      where: { village: { id: villageId } },
    });
  }

  findOne(
    where: Partial<Building>,
    options?: FindOneOptions<Building>,
  ): Promise<Building | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(
    id: number,
    options?: FindOneOptions<Building>,
  ): Promise<Building | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  findByIdAndVillageId(
    buildingId: number,
    villageId: number,
  ): Promise<Building | null> {
    return this.repository.findOne({
      where: {
        id: buildingId,
        village: { id: villageId },
      },
    });
  }

  findByVillageIdAndCoords(
    villageId: number,
    row: number,
    col: number,
  ): Promise<Building | null> {
    return this.repository.findOne({
      where: {
        village: { id: villageId },
        row,
        col,
      },
    });
  }

  create(entity: Partial<Building>): Building {
    return this.repository.create(entity);
  }

  save(entity: Building): Promise<Building> {
    return this.repository.save(entity);
  }

  update(id: number, entity: Partial<Building>): Promise<Building> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  deleteBy(
    criteria: number | FindOptionsWhere<Building>,
  ): Promise<DeleteResult> {
    return this.repository.delete(criteria);
  }
}
