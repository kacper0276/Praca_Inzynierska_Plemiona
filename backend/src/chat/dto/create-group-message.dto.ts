import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupMessageDto {
  @ApiProperty({ description: 'Treść wiadomości' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
