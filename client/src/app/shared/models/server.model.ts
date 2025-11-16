import { ServerStatus } from '../enums';
import { BaseModel } from './base.model';
import { ServerStatusLog } from './server-status-log.model';

export interface Server extends BaseModel {
  name: string;
  hostname: string;
  port: number;
  status: ServerStatus;
  lastChecked: Date;
  logs: ServerStatusLog[];
}
