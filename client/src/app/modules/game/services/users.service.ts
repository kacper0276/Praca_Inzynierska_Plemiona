import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { UserSearchResult } from '../interfaces/user-search-result.interface';
import { ApiResponse, FriendRequest } from '../../../shared/models';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly httpService: HttpService) {}

  searchUsers(query: string): Observable<ApiResponse<UserSearchResult[]>> {
    if (!query || query.trim() === '') {
      return of({ message: 'Empty query', data: [] });
    }

    return this.httpService.get<UserSearchResult[]>(`/users/search/${query}`);
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
