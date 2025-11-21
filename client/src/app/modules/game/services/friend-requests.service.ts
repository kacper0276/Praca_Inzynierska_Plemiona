import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable } from 'rxjs';
import { ApiResponse, FriendRequest } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class FriendRequestsService {
  constructor(private readonly httpService: HttpService) {}

  getSentFriendRequests(): Observable<ApiResponse<FriendRequest[]>> {
    return this.httpService.get<FriendRequest[]>(`/friend-requests/sent`);
  }

  sendFriendInvite(receiverId: number): Observable<ApiResponse<FriendRequest>> {
    return this.httpService.post<FriendRequest>(
      `/users/friends/invite/${receiverId}`,
      {}
    );
  }

  sendFriendInviteByEmail(
    receiverEmail: string
  ): Observable<ApiResponse<FriendRequest>> {
    const encodedEmail = encodeURIComponent(receiverEmail);
    return this.httpService.post<FriendRequest>(
      `/users/friends/invite-by-email/${encodedEmail}`,
      {}
    );
  }
}
