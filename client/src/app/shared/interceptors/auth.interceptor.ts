import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, TokenService } from '@modules/auth/services';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.tokenService.getJwtToken();

    if (req.url.includes('/auth/refresh')) {
      return next.handle(req);
    }

    let clonedRequest = req;
    if (token) {
      clonedRequest = req.clone({
        setHeaders: {
          authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleAuthError(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handleAuthError(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (refreshToken) {
      return this.http
        .post<any>(`${environment.apiUrl}/auth/refresh`, {
          refreshToken,
        })
        .pipe(
          switchMap((response) => {
            const newAccessToken = response.data.accessToken;

            this.tokenService.setJwtToken(newAccessToken);

            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });

            return next.handle(clonedRequest);
          }),
          catchError(() => {
            this.authService.logout();
            this.router.navigate(['/auth/login']);
            return throwError(
              () => new Error('Sesja wygasła. Zaloguj się ponownie.')
            );
          })
        );
    } else {
      this.authService.logout();
      const currentUrl = this.router.url;
      const isOnAuthPage =
        currentUrl.includes('/register') ||
        currentUrl.includes('/activate-account') ||
        currentUrl.includes('/login');
      if (!isOnAuthPage) {
        this.router.navigate(['/auth/login']);
        return EMPTY;
      }
      return throwError(() => new Error('Brak sesji. Zaloguj się ponownie.'));
    }
  }
}
