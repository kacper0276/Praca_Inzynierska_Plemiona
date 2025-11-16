import { ServerStatus } from '../enums';
import { BaseModel } from './base.model';
import { Server } from './server.model';

export interface ServerStatusLog extends BaseModel {
  status: ServerStatus;
  timestamp: Date;
  server: Server;
}
