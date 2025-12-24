import { BaseEntity } from '@core/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Quest } from './quest.entity';

@Entity({ name: 'quest_objectives' })
export class QuestObjective extends BaseEntity {
  @Column()
  description: string;

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
