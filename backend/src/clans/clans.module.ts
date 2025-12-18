import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { ClansService } from './services/clans.service';
import { ClansController } from './controllers/clans.controller';
import { ClansRepository } from './repositories/clans.repository';
import { UsersModule } from 'src/users/users.module';
import { ResourcesModule } from 'src/resources/resources.module';

@Module({
  imports: [TypeOrmModule.forFeature([Clan]), UsersModule, ResourcesModule],
  controllers: [ClansController],
  providers: [ClansService, ClansRepository],
})
export class ClansModule {}
