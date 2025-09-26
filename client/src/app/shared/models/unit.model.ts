import { UnitType } from '../enums/unit-type.enum';

export interface Unit {
  id: UnitType;
  name: string;
  level: number;
  count: number;
  cost: { wood: number; clay: number; iron: number };
}
