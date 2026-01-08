import { UnitType } from '@core/enums/unit-type.enum';

export interface ArmyRuntimeData {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetId?: number;
  state: string;
  totalHp: number;
  maxHp: number;
  damage: number;
  units: {
    type: UnitType;
    count: number;
    initialCount: number;
    level: number;
  }[];
}
