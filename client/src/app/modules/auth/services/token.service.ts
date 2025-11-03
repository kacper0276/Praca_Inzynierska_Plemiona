import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly JWT_TOKEN = 'jwt_token';
  private readonly REFRESH_TOKEN = 'refresh_token';

  getJwtToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  setJwtToken(token: string): void {
    localStorage.setItem(this.JWT_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN, token);
  }

  clearTokens(): void {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}
