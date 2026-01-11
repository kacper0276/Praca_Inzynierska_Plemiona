import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { LoginCredentials } from '../interfaces/login-credentials.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { RegisterCredentials } from '../interfaces/register-credentials.interface';
import { jwtDecode } from 'jwt-decode';
import { HttpService } from '@shared/services/http.service';
import { ApiResponse, User } from '@shared/models';
import { ResetPasswordData } from '../interfaces';

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

  forgotPassword(email: string): Observable<ApiResponse<null>> {
    return this.httpService.post<null>('/auth/forgot-password', { email });
  }

  resetPassword(data: ResetPasswordData): Observable<ApiResponse<null>> {
    return this.httpService.post<null>('/auth/reset-password', data);
  }

  activateAccount(code: string): Observable<ApiResponse<User>> {
    return this.httpService.post<User>('/auth/activate', { code });
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

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.tokenService.getJwtToken();
    if (!accessToken) {
      return null;
    }

    try {
      const decodedToken: { exp: number } = jwtDecode(accessToken);
      const isExpired = Date.now() >= decodedToken.exp * 1000;

      if (isExpired) {
        await lastValueFrom(this.refreshToken());
        return this.tokenService.getJwtToken();
      } else {
        return accessToken;
      }
    } catch (error) {
      console.error('Failed to get valid access token:', error);
      this.logout();
      return null;
    }
  }
}
