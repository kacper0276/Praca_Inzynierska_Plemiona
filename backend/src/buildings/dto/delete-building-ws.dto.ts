import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeleteBuildingWsDto {
  @ApiProperty({ description: 'ID usuwanego budynku', example: 1 })
  @IsInt()
  @Min(1)
  buildingId: number;
}
