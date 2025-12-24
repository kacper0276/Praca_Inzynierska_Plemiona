import { BaseEntity } from '@core/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { QuestObjective } from './quest-objective.entity';

@Entity({ name: 'quests' })
export class Quest extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 0 })
  woodReward: number;

  @Column({ default: 0 })
  clayReward: number;

  @Column({ default: 0 })
  ironReward: number;

  @Column({ default: 0 })
  populationReward: number;

  @OneToMany(() => QuestObjective, (objective) => objective.quest, {
    cascade: true,
  })
  objectives: QuestObjective[];
}
