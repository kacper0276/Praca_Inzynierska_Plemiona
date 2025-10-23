import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class VillageStateDto {
  @ApiProperty({
    description:
      'Stan siatki budynków w formacie JSON. Reprezentuje dwuwymiarową tablicę (BuildingData | null)[][].',
    example: '[ [null, {"id":1,"name":"Ratusz","level":1}], [null, null] ]',
  })
  @IsJSON({
    message: 'Stan budynków musi być prawidłowym ciągiem znaków JSON.',
  })
  @IsNotEmpty({ message: 'Stan budynków (buildingsJson) jest wymagany.' })
  buildingsJson: string;

  @ApiProperty({
    description: 'Współrzędna X centrum wioski na mapie świata',
    example: 150,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Współrzędna X musi być liczbą.' })
  centerX?: number;

  @ApiProperty({
    description: 'Współrzędna Y centrum wioski na mapie świata',
    example: 320,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Współrzędna Y musi być liczbą.' })
  centerY?: number;
}
