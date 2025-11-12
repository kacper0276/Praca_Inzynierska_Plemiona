import { IsString, IsNumber } from 'class-validator';

export class JoinServerRoomDto {
  @IsString()
  hostname: string;

  @IsNumber()
  port: number;
}
