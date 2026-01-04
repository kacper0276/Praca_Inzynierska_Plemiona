import { UnitType } from '@core/enums/unit-type.enum';

export const ARMY_COSTS = {
  [UnitType.WARRIOR]: { wood: 320, clay: 0, iron: 160 },
  [UnitType.ARCHER]: { wood: 15, clay: 0, iron: 3 },
  [UnitType.PIKEMAN]: { wood: 5, clay: 5, iron: 0 },
};
