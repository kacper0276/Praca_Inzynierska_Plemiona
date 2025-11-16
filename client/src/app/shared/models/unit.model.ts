import { UnitType } from '../enums';
import { BaseModel } from './base.model';

export interface Unit extends BaseModel {
  unitType: UnitType;
  name: string;
  level: number;
  count: number;
  cost: { wood: number; clay: number; iron: number };
}
