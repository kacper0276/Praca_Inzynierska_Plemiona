import { ServerStatus } from '../enums/server-status.enum';
import { BaseModel } from './base.model';
import { Server } from './server.model';

export interface ServerStatusLog extends BaseModel {
  status: ServerStatus;
  timestamp: Date;
  server: Server;
}
