import { ArmyUnit } from '@shared/models';

export interface UnitView extends ArmyUnit {
  name: string;
  description: string;
  icon: string;
  baseCost: { wood: number; clay: number; iron: number };
}
