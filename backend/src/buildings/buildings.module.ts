import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { VillagesModule } from 'src/villages/villages.module';
import { BuildingsService } from './services/buildings.service';
import { BuildingsRepository } from './repositories/buildings.repository';
import { BuildingsController } from './controllers/buildings.controller';
import { ResourcesModule } from 'src/resources/resources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building]),
    forwardRef(() => VillagesModule),
    forwardRef(() => ResourcesModule),
  ],
  providers: [BuildingsService, BuildingsRepository],
  controllers: [BuildingsController],
  exports: [BuildingsService],
})
export class BuildingsModule {}
