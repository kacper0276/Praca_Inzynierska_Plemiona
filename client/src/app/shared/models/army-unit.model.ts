import { UnitType } from '@shared/enums';

export interface ArmyUnit {
  id?: number;
  type: UnitType;
  count: number;
  level: number;
  villageId?: number;
}
