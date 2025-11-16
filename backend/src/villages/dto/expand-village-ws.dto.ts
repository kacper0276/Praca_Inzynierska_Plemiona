import { IsIn, IsObject } from 'class-validator';
import { ResourceCost } from 'src/core/consts/building-costs';

export class ExpandVillageWsDto {
  @IsIn(['left', 'right'])
  side: 'left' | 'right';

  @IsObject()
  cost: ResourceCost;
}
