import { Injectable, NotFoundException } from '@nestjs/common';
import { ServersRepository } from '../repositories/servers.repository';
import { CreateServerDto } from '../dto/create-server.dto';
import { UpdateServerDto } from '../dto/update-server.dto';
import { Server } from '../entities/server.entity';

@Injectable()
export class ServersService {
  constructor(private readonly repository: ServersRepository) {}

  async create(createServerDto: CreateServerDto): Promise<Server> {
    const server = this.repository.create(createServerDto);
    return this.repository.save(server);
  }

  async findAll(): Promise<Server[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<Server> {
    const server = await this.repository.findOneById(id);
    if (!server) {
      throw new NotFoundException(`Server with ID "${id}" not found`);
    }
    return server;
  }

  async update(id: number, updateServerDto: UpdateServerDto): Promise<Server> {
    await this.findOne(id);
    return this.repository.update(id, updateServerDto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
