import { FriendRequestStatus } from '@core/enums/friend-request-status.enum';
import { Entity, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '@core/entities/base.entity';

@Entity({ name: 'friend_requests' })
export class FriendRequest extends BaseEntity {
  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  receiver: User;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;
}
