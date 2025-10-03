import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resources } from './entities/resources.entity';
import { ResourcesService } from './services/resources.service';
import { ResourcesController } from './controllers/resources.controller';
import { ResourcesRepository } from './repositories/resources.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Resources])],
  providers: [ResourcesService, ResourcesRepository],
  controllers: [ResourcesController],
  exports: [ResourcesService],
})
export class ResourcesModule {}
