import { BaseModel } from './base.model';
import { QuestObjective } from './quest-objective.model';
import { UserQuestProgress } from './user-quest-progress.model';

export interface UserObjectiveProgress extends BaseModel {
  objective: QuestObjective;
  currentCount: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
  userQuest: UserQuestProgress;
}
