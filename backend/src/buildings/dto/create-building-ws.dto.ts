import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { BuildingName } from '@core/enums/building-name.enum';

export class CreateBuildingWsDto {
  @ApiProperty({
    description: 'Nazwa budynku',
    enum: BuildingName,
    example: BuildingName.TOWN_HALL,
  })
  @IsEnum(BuildingName, { message: 'Nieprawidłowa nazwa budynku.' })
  @IsNotEmpty({ message: 'Nazwa jest wymagana.' })
  name: BuildingName;

  @ApiProperty({ description: 'Pozycja wiersza w siatce', example: 1 })
  @IsInt({ message: 'Wiersz musi być liczbą całkowitą.' })
  @Min(0)
  row: number;

  @ApiProperty({ description: 'Pozycja kolumny w siatce', example: 1 })
  @IsInt({ message: 'Kolumna musi być liczbą całkowitą.' })
  @Min(0)
  col: number;

  @ApiProperty({ description: 'Id serwera', example: 1 })
  @IsInt({ message: 'Id musi być liczbą całkowitą' })
  serverId: number;
}
