import { BaseModel } from './base.model';

export interface BuildingData extends BaseModel {
  name: string;
  level: number;
  imageUrl: string;
  health?: number;
  maxHealth?: number;
  constructionFinishedAt?: Date | null;
  userLogin?: string;
  userVillageId?: number;
  upgradeFinishedAt?: string | Date | null;
  repairFinishedAt?: string | Date | null;
}
