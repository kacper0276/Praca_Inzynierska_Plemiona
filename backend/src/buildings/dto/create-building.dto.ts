import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BuildingName } from 'src/core/enums/building-name.enum';

export class CreateBuildingDto {
  @ApiProperty({
    description: 'Nazwa budynku',
    enum: BuildingName,
    example: BuildingName.TOWN_HALL,
  })
  @IsEnum(BuildingName, { message: 'Nieprawidłowa nazwa budynku.' })
  @IsNotEmpty({ message: 'Nazwa jest wymagana.' })
  name: BuildingName;

  @ApiProperty({ description: 'Poziom budynku', example: 1, default: 1 })
  @IsInt({ message: 'Poziom musi być liczbą całkowitą.' })
  @Min(1, { message: 'Poziom musi wynosić co najmniej 1.' })
  level: number;

  @ApiProperty({
    description: 'URL do obrazka budynku',
    example: 'assets/buildings/Ratusz.png',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Aktualne punkty życia',
    example: 150,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  health?: number;

  @ApiProperty({
    description: 'Maksymalne punkty życia',
    example: 150,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxHealth?: number;

  @ApiProperty({ description: 'Pozycja wiersza w siatce', example: 1 })
  @IsInt({ message: 'Wiersz musi być liczbą całkowitą.' })
  @Min(0)
  row: number;

  @ApiProperty({ description: 'Pozycja kolumny w siatce', example: 1 })
  @IsInt({ message: 'Kolumna musi być liczbą całkowitą.' })
  @Min(0)
  col: number;

  @ApiProperty({
    description: 'ID wioski, do której należy budynek',
    example: 1,
  })
  @IsInt({ message: 'ID wioski musi być liczbą całkowitą.' })
  @IsNotEmpty({ message: 'ID wioski jest wymagane.' })
  villageId: number;
}
