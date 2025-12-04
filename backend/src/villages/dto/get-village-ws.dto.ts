import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GetVillageWsDto {
  @ApiProperty({ description: 'Id serwera', example: 1 })
  @IsInt({ message: 'Id musi być liczbą całkowitą' })
  serverId: number;
}
