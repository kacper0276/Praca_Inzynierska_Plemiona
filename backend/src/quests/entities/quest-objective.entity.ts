import { BaseEntity } from '@core/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Quest } from './quest.entity';
import { QuestObjectiveType } from '@core/enums/quest-objective-type.enum';

@Entity({ name: 'quest_objectives' })
export class QuestObjective extends BaseEntity {
  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: QuestObjectiveType,
    default: QuestObjectiveType.BUILD,
  })
  type: QuestObjectiveType;

  @Column({ nullable: true })
  target: string;

  @Column()
  goalCount: number;

  @Column({ default: 0 })
  woodReward: number;

  @Column({ default: 0 })
  clayReward: number;

  @Column({ default: 0 })
  ironReward: number;

  @ManyToOne(() => Quest, (quest) => quest.objectives)
  quest: Quest;
}
