import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestObjective } from './entities/quest-objective.entity';
import { Quest } from './entities/quest.entity';
import { UserObjectiveProgress } from './entities/user-objective-progress.entity';
import { UserQuestProgress } from './entities/user-quest-progress.entity';
import { QuestsController } from './controllers/quests.controller';
import { QuestsService } from './services/quests.service';
import { QuestObjectivesRepository } from './repositories/quest-objectives.repository';
import { QuestsRepository } from './repositories/quests.repository';
import { UserObjectiveProgressRepository } from './repositories/user-objective-progress.repository';
import { UserQuestProgressRepository } from './repositories/user-quest-progress.repository';
import { ResourcesModule } from 'src/resources/resources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestObjective,
      Quest,
      UserObjectiveProgress,
      UserQuestProgress,
    ]),
    ResourcesModule,
  ],
  controllers: [QuestsController],
  providers: [
    QuestsService,
    QuestObjectivesRepository,
    QuestsRepository,
    UserObjectiveProgressRepository,
    UserQuestProgressRepository,
  ],
})
export class QuestsModule {}
