import { BuildingName } from '../enums/building-name.enum';
import { BuildingData } from '../models';

export const availableBuildings: BuildingData[] = [
  {
    id: 1,
    name: 'Dom mieszkalny',
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.RESIDENTIAL_HOUSE}.png`,
  },
  {
    id: 2,
    name: 'Glina',
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.CLAY_PIT}.png`,
  },
  {
    id: 3,
    name: 'Kuźnia',
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.SMITHY}.png`,
  },
  {
    id: 4,
    name: 'Młyn',
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.MILL}.png`,
  },
  {
    id: 5,
    name: 'Ratusz',
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.TOWN_HALL}.png`,
  },
  {
    id: 6,
    name: 'Spichlerz',
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.GRANARY}.png`,
  },
  {
    id: 7,
    name: 'Tartak',
    level: 1,
    imageUrl: `assets/buildings/${BuildingName.SAWMILL}.png`,
  },
];
