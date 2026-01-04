import { UnitType } from '@shared/enums';
import { UnitView } from '@shared/interfaces';

export const UNIT_CONFIG: Record<
  UnitType,
  Omit<UnitView, 'id' | 'type' | 'count' | 'level'>
> = {
  [UnitType.WARRIOR]: {
    name: 'Wojownik',
    description: 'Podstawowa jednostka piechoty.',
    icon: '',
    baseCost: { wood: 320, clay: 0, iron: 160 },
  },
  [UnitType.ARCHER]: {
    name: 'Łucznik',
    description: 'Skuteczny przeciwko piechocie.',
    icon: '',
    baseCost: { wood: 15, clay: 0, iron: 3 },
  },
  [UnitType.PIKEMAN]: {
    name: 'Pikinier',
    description: 'Zabójca kawalerii.',
    icon: '',
    baseCost: { wood: 5, clay: 5, iron: 0 },
  },
};
