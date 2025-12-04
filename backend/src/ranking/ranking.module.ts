import { Module } from '@nestjs/common';
import { ResourcesModule } from 'src/resources/resources.module';
import { ServersModule } from 'src/servers/servers.module';
import { VillagesModule } from 'src/villages/villages.module';
import { RankingController } from './controllers/ranking.controller';
import { RankingService } from './services/ranking.service';

@Module({
  imports: [ServersModule, VillagesModule, ResourcesModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
