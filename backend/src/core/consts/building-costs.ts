import { BuildingName } from '../enums/building-name.enum';

export interface ResourceCost {
  wood: number;
  clay: number;
  iron: number;
}

export const BUILDING_COSTS: Record<BuildingName, ResourceCost> = {
  [BuildingName.RESIDENTIAL_HOUSE]: { wood: 75, clay: 50, iron: 20 },
  [BuildingName.CLAY_PIT]: { wood: 40, clay: 80, iron: 30 },
  [BuildingName.SMITHY]: { wood: 120, clay: 100, iron: 150 },
  [BuildingName.MILL]: { wood: 90, clay: 80, iron: 40 },
  [BuildingName.TOWN_HALL]: { wood: 250, clay: 200, iron: 180 },
  [BuildingName.GRANARY]: { wood: 100, clay: 150, iron: 70 },
  [BuildingName.SAWMILL]: { wood: 150, clay: 60, iron: 40 },
};
