import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestObjectiveType } from '@core/enums/quest-objective-type.enum';
import { Type } from 'class-transformer';

export class CreateQuestObjectiveDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Zbuduj Tartak na poziom 5',
    description: 'Treść podpunktu',
  })
  description: string;

  @IsEnum(QuestObjectiveType)
  @IsNotEmpty()
  @ApiProperty({
    enum: QuestObjectiveType,
    example: 'UPGRADE_BUILDING',
    description: 'Typ zadania (BUILD, UPGRADE_BUILDING, TRAIN, GATHER, EXPAND)',
  })
  type: QuestObjectiveType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Tartak',
    description: 'Cel zadania (np. nazwa budynek lub jednostki)',
  })
  target: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 5,
    description: 'Wartość do osiągnięcia (np. ilość poziomów lub budynków)',
  })
  goalCount: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 100,
    description: 'Nagroda w drewnie za ten podpunkt',
    required: false,
  })
  woodReward?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 50,
    description: 'Nagroda w glinie za ten podpunkt',
    required: false,
  })
  clayReward?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 25,
    description: 'Nagroda w żelazie za ten podpunkt',
    required: false,
  })
  ironReward?: number = 0;
}
