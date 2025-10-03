import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  login: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  password: string;

  @IsString()
  repeatedPassword: string;
}
