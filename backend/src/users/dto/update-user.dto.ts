import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from 'src/core/enums/user-role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Imię użytkownika',
    example: 'Jan',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiProperty({
    description: 'Nazwisko użytkownika',
    example: 'Kowalski',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiProperty({
    description: 'Publiczna nazwa użytkownika (login)',
    example: 'jankowalski',
    required: false,
  })
  @IsOptional()
  @IsString()
  login?: string;

  @ApiProperty({
    description: 'Krótki opis, biografia użytkownika',
    example: 'Pasjonat programowania i górskich wędrówek.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Rola użytkownika (tylko dla admina)',
    required: false,
  })
  role?: UserRole;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profileImage?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  backgroundImage?: any;
}
