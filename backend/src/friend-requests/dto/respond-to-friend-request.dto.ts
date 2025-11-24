import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FriendRequestStatus } from 'src/core/enums/friend-request-status.enum';

export class RespondToFriendRequestDto {
  @ApiProperty({
    enum: [FriendRequestStatus.ACCEPTED, FriendRequestStatus.DECLINED],
    description: 'Nowy status zaproszenia (accepted lub declined)',
    example: FriendRequestStatus.ACCEPTED,
  })
  @IsEnum(FriendRequestStatus, {
    message: 'Status must be either accepted or declined',
  })
  status: FriendRequestStatus;
}
