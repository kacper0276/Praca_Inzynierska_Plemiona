import { Injectable, NotFoundException } from '@nestjs/common';
import { ServersRepository } from '../repositories/servers.repository';
import { CreateServerDto } from '../dto/create-server.dto';
import { UpdateServerDto } from '../dto/update-server.dto';
import { Server } from '../entities/server.entity';
import { WsGateway } from 'src/core/gateways/ws.gateway';
import { ServerStatus } from '../enums/server-status.enum';

@Injectable()
export class ServersService {
  constructor(
    private readonly repository: ServersRepository,
    private readonly wsGateway: WsGateway,
  ) {}

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

  async updateServerStatus(serverId: number, newStatus: ServerStatus) {
    const server = await this.repository.findOne({ id: serverId });
    if (server) {
      server.status = newStatus;
      server.lastChecked = new Date();
      await this.repository.save(server);

      this.wsGateway.emitServerStatusUpdate(
        server.hostname,
        server.port,
        server.status,
        server.lastChecked,
      );
    }
  }
}
