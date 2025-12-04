import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetVillageWsDto {
  @ApiProperty({ description: 'Id serwera', example: 1 })
  @IsNumber()
  serverId: number;
}
