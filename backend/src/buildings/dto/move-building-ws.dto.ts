import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class MoveBuildingWsDto {
  @ApiProperty({ description: 'ID przesuwanego budynku', example: 1 })
  @IsInt()
  @Min(1)
  buildingId: number;

  @ApiProperty({ description: 'Nowa pozycja wiersza w siatce', example: 2 })
  @IsInt()
  @Min(0)
  row: number;

  @ApiProperty({ description: 'Nowa pozycja kolumny w siatce', example: 3 })
  @IsInt()
  @Min(0)
  col: number;
}
