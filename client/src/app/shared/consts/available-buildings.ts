import { BuildingName } from '../enums/building-name.enum';
import { BuildingData } from '../models';

export const availableBuildings: BuildingData[] = [
  {
    id: 1,
    name: BuildingName.RESIDENTIAL_HOUSE,
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.RESIDENTIAL_HOUSE}.png`,
  },
  {
    id: 2,
    name: BuildingName.CLAY_PIT,
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.CLAY_PIT}.png`,
  },
  {
    id: 3,
    name: BuildingName.SMITHY,
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.SMITHY}.png`,
  },
  {
    id: 4,
    name: BuildingName.MILL,
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.MILL}.png`,
  },
  {
    id: 5,
    name: BuildingName.TOWN_HALL,
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.TOWN_HALL}.png`,
  },
  {
    id: 6,
    name: BuildingName.GRANARY,
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.GRANARY}.png`,
  },
  {
    id: 7,
    name: BuildingName.SAWMILL,
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.SAWMILL}.png`,
  },
];
