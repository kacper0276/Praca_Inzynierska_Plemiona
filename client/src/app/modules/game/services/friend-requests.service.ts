import { Injectable } from '@angular/core';
import { FriendRequestStatus } from '@shared/enums';
import { ApiResponse, FriendRequest } from '@shared/models';
import { HttpService } from '@shared/services/http.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FriendRequestsService {
  constructor(private readonly httpService: HttpService) {}

  getSentFriendRequests(): Observable<ApiResponse<FriendRequest[]>> {
    return this.httpService.get<FriendRequest[]>(`/friend-requests/sent`);
  }

  getReceivedFriendRequests(): Observable<ApiResponse<FriendRequest[]>> {
    return this.httpService.get<FriendRequest[]>(`/friend-requests/received`);
  }

  getAllFriendRequests(): Observable<ApiResponse<FriendRequest[]>> {
    return this.httpService.get<FriendRequest[]>(`/friend-requests/all`);
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

  respondToFriendRequest(
    requestId: number,
    status: FriendRequestStatus
  ): Observable<ApiResponse<FriendRequest>> {
    return this.httpService.patch<FriendRequest>(
      `/friend-requests/${requestId}/respond`,
      {
        status,
      }
    );
  }
}
