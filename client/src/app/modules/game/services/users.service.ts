import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { UserSearchResult } from '../interfaces/user-search-result.interface';
import { ApiResponse, User } from '../../../shared/models';
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

  fetchAllUsers(): Observable<ApiResponse<User[]>> {
    return this.httpService.get<User[]>('/users');
  }
}
