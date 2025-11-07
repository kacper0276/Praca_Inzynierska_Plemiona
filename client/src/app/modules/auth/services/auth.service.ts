import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { HttpService } from '../../../shared/services/http.service';
import { ApiResponse, User } from '../../../shared/models';
import { LoginCredentials } from '../interfaces/login-credentials.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { RegisterCredentials } from '../interfaces/register-credentials.interface copy';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) {}

  login(credentials: LoginCredentials): Observable<ApiResponse<LoginResponse>> {
    return this.httpService
      .post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap((response) => {
          this.tokenService.setJwtToken(response.data.accessToken);
          this.tokenService.setRefreshToken(response.data.refreshToken);
          this.userService.setUser(response.data.user);
        })
      );
  }

  registerUser(
    credentials: RegisterCredentials
  ): Observable<ApiResponse<User>> {
    return this.httpService.post<User>('/auth/register', credentials);
  }

  activateAccount(code: string): Observable<ApiResponse<User>> {
    return this.httpService.post<User>('', { code });
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.userService.setUser(null);
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getJwtToken();
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.httpService.post<any>('/auth/refresh', { refreshToken }).pipe(
      tap((response) => {
        this.tokenService.setJwtToken(response.data.accessToken);
      })
    );
  }
}
