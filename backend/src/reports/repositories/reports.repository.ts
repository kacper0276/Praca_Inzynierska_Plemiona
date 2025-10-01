import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/repositories/base.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReportsRepository extends BaseRepository<Report> {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {
    super();
  }

  findAll(options?: any): Promise<Report[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<Report>, options?: any): Promise<Report | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<Report | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(entity: Partial<Report>): Report {
    return this.repository.create(entity);
  }

  save(entity: Report): Promise<Report> {
    return this.repository.save(entity);
  }

  update(id: number, entity: Partial<Report>): Promise<Report> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
