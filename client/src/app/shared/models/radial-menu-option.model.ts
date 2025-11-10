import { BaseModel } from './base.model';

export interface RadialMenuOption extends BaseModel {
  action: string;
  iconName?: string;
  iconUrl?: string;
  tooltip?: string;
}
