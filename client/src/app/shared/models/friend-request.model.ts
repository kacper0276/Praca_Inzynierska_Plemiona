import { FriendRequestStatus } from '../enums';
import { User } from './user.model';

export interface FriendRequest {
  id: number;
  status: FriendRequestStatus;
  sender: User;
  receiver: User;
}
