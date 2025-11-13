import { forwardRef, Module } from '@nestjs/common';
import { VillagesController } from './controllers/villages.controller';
import { VillagesService } from './services/villages.service';
import { VillagesRepository } from './repositories/villages.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Village } from './entities/village.entity';
import { UsersModule } from 'src/users/users.module';
import { BuildingsModule } from 'src/buildings/buildings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Village]),
    forwardRef(() => UsersModule),
    forwardRef(() => BuildingsModule),
  ],
  controllers: [VillagesController],
  providers: [VillagesService, VillagesRepository],
  exports: [VillagesService, VillagesRepository],
})
export class VillagesModule {}
