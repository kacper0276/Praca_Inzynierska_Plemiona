import { BaseModel } from './base.model';
import { QuestObjective } from './quest-objective.model';

export interface UserObjectiveProgress extends BaseModel {
  objective: QuestObjective;
  currentCount: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
}
