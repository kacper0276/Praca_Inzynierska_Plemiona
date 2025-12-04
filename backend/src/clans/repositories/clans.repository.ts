import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@core/repositories/base.repository';
import { Clan } from '../entities/clan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ClansRepository extends BaseRepository<Clan> {
  constructor(
    @InjectRepository(Clan) private readonly repository: Repository<Clan>,
  ) {
    super();
  }

  findAll(options?: any): Promise<Clan[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<Clan>, options?: any): Promise<Clan> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<Clan> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(data: Partial<Clan>): Clan {
    return this.repository.create(data);
  }

  update(id: number, data: Partial<Clan>): Promise<Clan> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  save(data: Partial<Clan>): Promise<Clan> {
    return this.repository.save(data);
  }
}
