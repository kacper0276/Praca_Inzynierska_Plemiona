import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateReportDto {
  @ApiPropertyOptional({
    description: 'email użytkownika, który jest zgłaszany',
    example: 'email@example.com',
  })
  @IsOptional()
  @IsEmail()
  targetUser?: string;

  @ApiProperty({
    description: 'Tytuł opisu',
    example: 'Obraźliwa wiadomość.',
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, {
    message: 'Tytuł zgłoszenia musi mieć co najmniej 5 znaków.',
  })
  title: string;

  @ApiProperty({
    description: 'Treść zgłoszenia, opis problemu',
    example: 'Ten użytkownik używa obraźliwego języka w czacie.',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Zgłoszenie musi mieć co najmniej 10 znaków.' })
  content: string;
}
