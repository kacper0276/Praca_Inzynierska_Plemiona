import { BaseModel } from './base.model';

export interface BuildingData extends BaseModel {
  name: string;
  level: number;
  imageUrl: string;
  health?: number;
  maxHealth?: number;
}
