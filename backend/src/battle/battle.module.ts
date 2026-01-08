import { Module } from '@nestjs/common';
import { BattlesService } from './services/battles.service';
import { VillagesModule } from 'src/villages/villages.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [VillagesModule, UsersModule],
  providers: [BattlesService],
  exports: [BattlesService],
})
export class BattleModule {}
