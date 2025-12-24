import { BaseEntity } from '@core/entities/base.entity';
import { Entity, ManyToOne, Column } from 'typeorm';
import { QuestObjective } from './quest-objective.entity';
import { UserQuestProgress } from './user-quest-progress.entity';

@Entity({ name: 'user_objective_progress' })
export class UserObjectiveProgress extends BaseEntity {
  @ManyToOne(() => UserQuestProgress, (uqp) => uqp.objectivesProgress)
  userQuest: UserQuestProgress;

  @ManyToOne(() => QuestObjective)
  objective: QuestObjective;

  @Column({ default: 0 })
  currentCount: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: false })
  rewardClaimed: boolean;
}
