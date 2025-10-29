import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail({}, { message: 'Proszę podać poprawny adres email.' })
  @IsNotEmpty({ message: 'Email nie może być pusty.' })
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adres email użytkownika',
  })
  email: string;

  @IsString({ message: 'Login musi być ciągiem znaków' })
  @IsNotEmpty({ message: 'Login nie może być pusty.' })
  @ApiProperty({
    example: 'login123',
    description: 'Login użytkownika',
  })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'Hasło nie może być puste.' })
  @ApiProperty({ description: 'Hasło użytkownika', minLength: 8 })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Hasło nie może być puste.' })
  @ApiProperty({ description: 'Powtórzone hasło', minLength: 8 })
  repeated_password: string;

  @IsString()
  @IsNotEmpty({ message: 'Imie nie może być puste.' })
  @ApiProperty({ description: 'Imię użytkownika', example: 'Jan' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Nazwisko nie może być puste.' })
  @ApiProperty({ description: 'Nazwisko użytkownika', example: 'Kowalski' })
  lastName: string;
}
