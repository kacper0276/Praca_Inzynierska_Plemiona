import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Proszę podać poprawny adres email.' })
  @IsNotEmpty({ message: 'Email nie może być pusty.' })
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adres email użytkownika',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Hasło nie może być puste.' })
  @ApiProperty({ description: 'Hasło użytkownika' })
  password: string;
}
