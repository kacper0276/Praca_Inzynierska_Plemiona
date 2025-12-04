import { Injectable } from '@angular/core';
import { LocalStorageService } from '@shared/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly JWT_TOKEN = 'jwt_token';
  private readonly REFRESH_TOKEN = 'refresh_token';

  constructor(private readonly localStorageService: LocalStorageService) {}

  getJwtToken(): string | null {
    return this.localStorageService.getItem<string>(this.JWT_TOKEN);
  }

  setJwtToken(token: string): void {
    this.localStorageService.setItem(this.JWT_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return this.localStorageService.getItem<string>(this.REFRESH_TOKEN);
  }

  setRefreshToken(token: string): void {
    this.localStorageService.setItem(this.REFRESH_TOKEN, token);
  }

  clearTokens(): void {
    this.localStorageService.removeItem(this.JWT_TOKEN);
    this.localStorageService.removeItem(this.REFRESH_TOKEN);
  }
}
