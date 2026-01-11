import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1...' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsNotEmpty()
  repeatedPassword: string;
}
