import { BaseModel } from './base.model';

export interface QuestObjective extends BaseModel {
  description: string;
  goalCount: number;
  woodReward: number;
  clayReward: number;
  ironReward: number;
}
