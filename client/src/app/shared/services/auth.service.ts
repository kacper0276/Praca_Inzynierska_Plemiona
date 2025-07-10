import { Injectable } from '@angular/core';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly JWT_TOKEN = 'jwt_token';
  private readonly REFRESH_TOKEN = 'refresh_token';
  private readonly USER = 'user';
  private currentUser: User | null = null;

  public setJwtToken(token: string): void {
    localStorage.setItem(this.JWT_TOKEN, token);
  }

  public getJwtToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  public setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN, token);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  public setUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem(this.USER, JSON.stringify(user));
  }

  public getUser(): any {
    return this.currentUser;
  }

  public getUserId(): number {
    return this.currentUser?.id ?? -1;
  }

  public setLoginData(token: string, refreshToken: string, user: User): void {
    localStorage.setItem(this.JWT_TOKEN, token);
    localStorage.setItem(this.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(this.USER, JSON.stringify(user));
    this.currentUser = user;
  }

  public isLoggedIn(): boolean {
    return Boolean(this.currentUser);
  }

  public clearStorage(): void {
    localStorage.clear();
  }

  public logout(): void {
    this.clearStorage();
    this.currentUser = null;
  }
}
