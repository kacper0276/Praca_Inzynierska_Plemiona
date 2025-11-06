import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse, User } from '../../../shared/models';
import { HttpService } from '../../../shared/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );

  constructor(private readonly http: HttpService) {}

  public currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  setUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(user);
  }

  getUserFromToken(): Observable<ApiResponse<User>> {
    return this.http.get<User>('/auth/profile');
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? (JSON.parse(userJson) as User) : null;
  }
}
