import { BaseModel } from './base.model';
import { QuestObjective } from './quest-objective.model';

export interface Quest extends BaseModel {
  title: string;
  description: string;
  woodReward: number;
  clayReward: number;
  ironReward: number;
  populationReward: number;
  objectives: QuestObjective[];
}
