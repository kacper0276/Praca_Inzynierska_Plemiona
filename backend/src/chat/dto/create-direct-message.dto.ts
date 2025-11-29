import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDirectMessageDto {
  @ApiProperty({ description: 'ID odbiorcy wiadomości' })
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @ApiProperty({ description: 'Treść wiadomości' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
