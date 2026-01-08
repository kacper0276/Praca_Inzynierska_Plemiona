import { ArmyRuntimeData } from './army-runtime-data.model';

export interface BattleState {
  attackerId: number;
  defenderId: number;
  attackerArmy: ArmyRuntimeData;
  defenderArmy: ArmyRuntimeData;
  buildings: any[];
  interval: NodeJS.Timeout;
}
