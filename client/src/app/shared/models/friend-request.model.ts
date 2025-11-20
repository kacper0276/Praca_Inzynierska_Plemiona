import { FriendRequestStatus } from '../enums';

export interface FriendRequest {
  id: number;
  status: FriendRequestStatus;
}
