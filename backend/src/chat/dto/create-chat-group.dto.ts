import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatGroupDto {
  @ApiProperty({ description: 'Nazwa grupy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Opis grupy', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Lista ID użytkowników do dodania',
    required: false,
  })
  @IsArray()
  @IsOptional()
  memberIds?: number[];
}
