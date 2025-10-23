import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Ilość drewna posiadana przez użytkownika',
    example: 100,
    default: 0,
  })
  @IsInt({ message: 'Wartość drewna musi być liczbą całkowitą.' })
  @Min(0, { message: 'Wartość drewna nie może być ujemna.' })
  wood: number;

  @ApiProperty({
    description: 'Ilość gliny posiadana przez użytkownika',
    example: 100,
    default: 0,
  })
  @IsInt({ message: 'Wartość gliny musi być liczbą całkowitą.' })
  @Min(0, { message: 'Wartość gliny nie może być ujemna.' })
  clay: number;

  @ApiProperty({
    description: 'Ilość żelaza posiadana przez użytkownika',
    example: 100,
    default: 0,
  })
  @IsInt({ message: 'Wartość żelaza musi być liczbą całkowitą.' })
  @Min(0, { message: 'Wartość żelaza nie może być ujemna.' })
  iron: number;

  @ApiProperty({
    description: 'Aktualna populacja/liczebność',
    example: 50,
    default: 0,
  })
  @IsInt({ message: 'Wartość populacji musi być liczbą całkowitą.' })
  @Min(0, { message: 'Wartość populacji nie może być ujemna.' })
  population: number;

  @ApiProperty({
    description: 'Maksymalna pojemność populacji',
    example: 200,
  })
  @IsInt({
    message: 'Wartość maksymalnej populacji musi być liczbą całkowitą.',
  })
  @Min(1, { message: 'Wartość maksymalnej populacji musi być dodatnia.' })
  maxPopulation: number;

  @ApiProperty({
    description: 'Identyfikator użytkownika, do którego przypisane są surowce',
    example: 1,
  })
  @IsInt({ message: 'ID użytkownika musi być liczbą całkowitą.' })
  @IsNotEmpty({ message: 'ID użytkownika jest wymagane.' })
  userId: number;
}
