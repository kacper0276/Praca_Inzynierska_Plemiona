import { User } from './user.model';
import { Server } from './server.model';
import { Quest } from './quest.model';
import { BaseModel } from './base.model';
import { UserObjectiveProgress } from './user-objective-progress.model';

export interface UserQuestProgress extends BaseModel {
  user: User;
  server: Server;
  quest: Quest;
  isCompleted: boolean;
  completedAt: Date | string | null;
  objectivesProgress: UserObjectiveProgress[];
}
