import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestObjectiveDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Zbuduj Tartak na poziom 5',
    description: 'Treść podpunktu',
  })
  description: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 5,
    description: 'Wartość do osiągnięcia (np. ilość poziomów lub budynków)',
  })
  goalCount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 100,
    description: 'Nagroda w drewnie za ten podpunkt',
    required: false,
  })
  woodReward?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 50,
    description: 'Nagroda w glinie za ten podpunkt',
    required: false,
  })
  clayReward?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 25,
    description: 'Nagroda w żelazie za ten podpunkt',
    required: false,
  })
  ironReward?: number = 0;
}
