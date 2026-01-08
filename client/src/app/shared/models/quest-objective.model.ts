import { QuestObjectiveType } from '@shared/enums';
import { BaseModel } from './base.model';
import { Quest } from './quest.model';

export interface QuestObjective extends BaseModel {
  description: string;
  type: QuestObjectiveType;
  target: string;
  goalCount: number;
  woodReward: number;
  clayReward: number;
  ironReward: number;
  quest?: Quest;
}
