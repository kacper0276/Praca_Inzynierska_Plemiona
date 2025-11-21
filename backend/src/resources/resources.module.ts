import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resources } from './entities/resources.entity';
import { ResourcesService } from './services/resources.service';
import { ResourcesController } from './controllers/resources.controller';
import { ResourcesRepository } from './repositories/resources.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resources]),
    forwardRef(() => UsersModule),
  ],
  providers: [ResourcesService, ResourcesRepository],
  controllers: [ResourcesController],
  exports: [ResourcesService],
})
export class ResourcesModule {}
