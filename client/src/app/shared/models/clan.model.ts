import { BaseModel } from './base.model';
import { Server } from './server.model';
import { User } from './user.model';

export interface Clan extends BaseModel {
  name: string;
  description?: string;
  founder: User;
  members: User[];
  server: Server;
}
