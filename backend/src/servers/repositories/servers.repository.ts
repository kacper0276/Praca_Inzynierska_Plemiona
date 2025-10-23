import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/repositories/base.repository';
import { Server } from '../entities/server.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ServersRepository extends BaseRepository<Server> {
  constructor(
    @InjectRepository(Server)
    private readonly repository: Repository<Server>,
  ) {
    super();
  }

  findAll(options?: any): Promise<Server[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<Server>, options?: any): Promise<Server | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<Server | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(entity: Partial<Server>): Server {
    return this.repository.create(entity);
  }

  save(entity: Server): Promise<Server> {
    return this.repository.save(entity);
  }

  update(id: number, entity: Partial<Server>): Promise<Server> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
