import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'ID użytkownika, który jest zgłaszany',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  targetUserId: number;

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
