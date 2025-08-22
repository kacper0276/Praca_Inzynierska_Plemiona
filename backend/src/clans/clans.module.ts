import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clan } from './entities/clan.entity';
import { ClansService } from './services/clans.service';
import { ClansController } from './controllers/clans.controller';
import { ClansRepository } from './repositories/clans.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Clan])],
  controllers: [ClansController],
  providers: [ClansService, ClansRepository],
})
export class ClansModule {}
