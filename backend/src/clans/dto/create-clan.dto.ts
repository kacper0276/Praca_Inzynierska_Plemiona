import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateClanDto {
  @ApiProperty({
    description: 'Unikalna nazwa klanu',
    example: 'Żelazne Wilki',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Nazwa musi być ciągiem znaków.' })
  @IsNotEmpty({ message: 'Nazwa klanu jest wymagana.' })
  @MinLength(3, { message: 'Nazwa musi mieć co najmniej 3 znaki.' })
  @MaxLength(50, { message: 'Nazwa nie może być dłuższa niż 50 znaków.' })
  name: string;

  @ApiProperty({
    description: 'Opis klanu wyjaśniający jego cele i zasady',
    example:
      'Jesteśmy grupą graczy skoncentrowaną na raidach i wspólnej zabawie.',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Opis musi być ciągiem znaków.' })
  @MaxLength(1000, { message: 'Opis nie może przekraczać 1000 znaków.' })
  description?: string;

  @ApiProperty({
    description: 'Lista ID użytkowników do dodania jako pierwsi członkowie',
    example: [1, 5, 12],
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: 'Identyfikatory członków muszą być w tablicy.' })
  @IsInt({
    each: true,
    message: 'Każdy identyfikator członka musi być liczbą całkowitą.',
  })
  @ArrayUnique({
    message: 'Identyfikatory użytkowników nie mogą się powtarzać.',
  })
  readonly memberIds?: number[];

  @ApiProperty({
    description: 'Id użytkownika który zakłada klan',
    example: 1,
    required: true,
  })
  @IsInt()
  founderId: number;

  @ApiProperty({
    description: 'Id serwera na którym ma być utworzony klan',
    example: 1,
    required: true,
  })
  @IsInt()
  serverId: number;
}
