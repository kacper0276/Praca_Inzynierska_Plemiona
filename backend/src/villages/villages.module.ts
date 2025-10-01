import { Module } from '@nestjs/common';
import { VillagesController } from './controllers/villages.controller';
import { VillagesService } from './services/villages.service';
import { VillagesRepository } from './repositories/villages.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Village } from './entities/village.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Village])],
  controllers: [VillagesController],
  providers: [VillagesService, VillagesRepository],
  exports: [VillagesService],
})
export class VillagesModule {}
