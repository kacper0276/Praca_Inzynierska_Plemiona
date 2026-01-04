import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArmyUnit } from './entities/army-unit.entity';
import { ArmyController } from './controllers/army.controller';
import { ArmyService } from './services/army.service';
import { ArmyRepository } from './repositories/army.repository';
import { ResourcesModule } from 'src/resources/resources.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArmyUnit]), ResourcesModule],
  controllers: [ArmyController],
  providers: [ArmyService, ArmyRepository],
})
export class ArmyModule {}
