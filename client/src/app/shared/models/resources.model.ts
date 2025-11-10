import { BaseModel } from './base.model';

export interface Resources extends BaseModel {
  wood: number;
  clay: number;
  iron: number;
  population: number;
  maxPopulation: number;
}
