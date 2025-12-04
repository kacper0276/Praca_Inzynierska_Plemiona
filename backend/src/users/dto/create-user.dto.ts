import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@core/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Adres e-mail użytkownika (musi być unikalny)',
    example: 'jan.kowalski@example.com',
  })
  @IsEmail({}, { message: 'Nieprawidłowy format adresu e-mail.' })
  @IsNotEmpty({ message: 'Adres e-mail jest wymagany.' })
  email: string;

  @ApiProperty({
    description: 'Login użytkownika (musi być unikalny)',
    example: 'jankowalski',
  })
  @IsString()
  @IsNotEmpty({ message: 'Login jest wymagany.' })
  login: string;

  @ApiProperty({
    description: 'Hasło użytkownika (minimum 8 znaków)',
    example: 'superSecurePassword123',
  })
  @IsString()
  @MinLength(8, { message: 'Hasło musi mieć co najmniej 8 znaków.' })
  password: string;

  @ApiProperty({
    description: 'Imię użytkownika',
    example: 'Jan',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Nazwisko użytkownika',
    example: 'Kowalski',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Rola przypisana do użytkownika',
    enum: UserRole,
    default: UserRole.USER,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Nieprawidłowa rola użytkownika.' })
  role?: UserRole;
}
