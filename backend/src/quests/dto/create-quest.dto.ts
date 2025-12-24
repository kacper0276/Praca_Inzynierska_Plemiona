import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateQuestObjectiveDto } from './create-quest-objective.dto';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Początki gospodarki', description: 'Tytuł zadania' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Rozwiń swoje kopalnie, aby zwiększyć produkcję.',
    description: 'Opis zadania',
  })
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 500,
    description: 'Główna nagroda: drewno',
    required: false,
  })
  woodReward?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 500,
    description: 'Główna nagroda: glina',
    required: false,
  })
  clayReward?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 500,
    description: 'Główna nagroda: żelazo',
    required: false,
  })
  ironReward?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 10,
    description: 'Główna nagroda: populacja',
    required: false,
  })
  populationReward?: number = 0;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestObjectiveDto)
  @ApiProperty({
    type: [CreateQuestObjectiveDto],
    description: 'Lista podpunktów do wykonania w ramach zadania',
  })
  objectives: CreateQuestObjectiveDto[];
}
