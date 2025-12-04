import { IsIn, IsInt, IsObject } from 'class-validator';
import { ResourceCost } from '@core/consts/building-costs';
import { ApiProperty } from '@nestjs/swagger';

export class ExpandVillageWsDto {
  @ApiProperty({ description: 'Kierunek rozszerzenie wioski', example: 'left' })
  @IsIn(['left', 'right'])
  side: 'left' | 'right';

  @ApiProperty({
    description: 'Ile zasobów zostanie odjęte za roszerzenie terenu wioski',
  })
  @IsObject()
  cost: ResourceCost;

  @ApiProperty({ description: 'Id serwera', example: 1 })
  @IsInt({ message: 'Id musi być liczbą całkowitą' })
  serverId: number;
}
