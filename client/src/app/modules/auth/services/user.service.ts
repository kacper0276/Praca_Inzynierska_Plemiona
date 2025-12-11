import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import { UpdateUser } from '../interfaces/update-user.interface';
import { UpdateUserResposne } from '../interfaces/update-user-response.interface';
import { User, ApiResponse } from '@shared/models';
import { HttpService } from '@shared/services/http.service';
import { LocalStorageService } from '@shared/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );

  constructor(
    private readonly http: HttpService,
    private readonly tokenService: TokenService,
    private readonly localStorageService: LocalStorageService
  ) {}

  public currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  setUser(user: User | null): void {
    if (user) {
      this.localStorageService.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      this.localStorageService.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(user);
  }

  getUserFromToken(): Observable<ApiResponse<User>> {
    return this.http.get<User>('/auth/profile');
  }

  getUserByEmail(email: string): Observable<ApiResponse<User>> {
    return this.http.get<User>(`/users/by-email/${email}`);
  }

  private getUserFromStorage(): User | null {
    return this.localStorageService.getItem<User>(this.USER_KEY);
  }

  updateUser(
    originalEmail: string,
    userData: UpdateUser,
    profileImage?: File | null,
    backgroundImage?: File | null
  ): Observable<ApiResponse<UpdateUserResposne>> {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      const value = (userData as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (profileImage) {
      formData.append('profileImage', profileImage, profileImage.name);
    }
    if (backgroundImage) {
      formData.append('backgroundImage', backgroundImage, backgroundImage.name);
    }

    return this.http
      .patch<UpdateUserResposne>(
        `/users/update-user-and-login/${originalEmail}`,
        formData
      )
      .pipe(
        tap((response) => {
          const { user, accessToken, refreshToken } = response.data;

          this.setUser(user);

          this.tokenService.setJwtToken(accessToken);
          this.tokenService.setRefreshToken(refreshToken);
        })
      );
  }
}
