import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { VillagesModule } from 'src/villages/villages.module';
import { BuildingsService } from './services/buildings.service';
import { BuildingsRepository } from './repositories/buildings.repository';
import { BuildingsController } from './controllers/buildings.controller';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building]),
    forwardRef(() => VillagesModule),
    forwardRef(() => CoreModule),
  ],
  providers: [BuildingsService, BuildingsRepository],
  controllers: [BuildingsController],
  exports: [BuildingsService],
})
export class BuildingsModule {}
