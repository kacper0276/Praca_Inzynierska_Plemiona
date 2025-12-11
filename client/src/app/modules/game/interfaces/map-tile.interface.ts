import { MapVillage } from './map-village.interface';

export interface MapTile {
  x: number;
  y: number;
  village?: MapVillage;
}
