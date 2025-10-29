import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { ServersController } from './controllers/servers.controller';
import { ServersService } from './services/servers.service';
import { ServersRepository } from './repositories/servers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Server])],
  controllers: [ServersController],
  providers: [ServersService, ServersRepository],
  exports: [ServersService],
})
export class ServersModule {}
