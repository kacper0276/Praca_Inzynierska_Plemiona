import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiResponse, User } from '@shared/models';
import { HttpService } from '@shared/services';
import { UserSearchResult } from '../interfaces';
import { UpdateUser, UpdateUserResposne } from '@modules/auth/interfaces';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly httpService: HttpService) {}

  searchUsers(query: string): Observable<ApiResponse<UserSearchResult[]>> {
    if (!query || query.trim() === '') {
      return of({ message: 'Empty query', data: [] });
    }

    return this.httpService.get<UserSearchResult[]>(`/users/search/${query}`);
  }

  fetchAllUsers(): Observable<ApiResponse<User[]>> {
    return this.httpService.get<User[]>('/users');
  }

  fetchFriendsWithoutClans(serverId: number): Observable<ApiResponse<User[]>> {
    return this.httpService.get<User[]>(`/users/without-clans/${serverId}`);
  }

  deleteUser(userId: number): Observable<ApiResponse<null>> {
    return this.httpService.delete<null>(`/users/${userId}`);
  }

  updateUser(
    originalEmail: string,
    userData: UpdateUser
  ): Observable<ApiResponse<UpdateUserResposne>> {
    return this.httpService.patch<UpdateUserResposne>(
      `/users/update-user/${originalEmail}`,
      userData
    );
  }
}
