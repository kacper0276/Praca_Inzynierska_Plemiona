import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ActivateAccountDto {
  @ApiProperty({
    description: 'Kod aktywacyjny otrzymany w wiadomości e-mail',
    example: 'A1B2C3',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  readonly code: string;
}
