import { IsString, IsNumber, IsInt } from 'class-validator';

export class JoinServerRoomDto {
  @IsInt()
  serverId: number;

  @IsString()
  hostname: string;

  @IsNumber()
  port: number;

  @IsString()
  userEmail: string;
}
