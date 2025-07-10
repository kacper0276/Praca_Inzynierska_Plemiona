import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getJwtToken();

    let clonedRequest = req;
    if (token) {
      clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          return this.handleAuthError(req, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private handleAuthError(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const refreshToken = this.authService.getRefreshToken();

    if (refreshToken) {
      return this.http
        .post<any>(`${environment.apiUrl}refresh-token`, { refreshToken })
        .pipe(
          switchMap((response) => {
            const newAccessToken = response.accessToken;
            const newRefreshToken = response.refreshToken;

            this.authService.setJwtToken(newAccessToken);
            this.authService.setRefreshToken(newRefreshToken);

            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });

            return next.handle(clonedRequest);
          }),
          catchError(() => {
            this.authService.clearStorage();
            this.router.navigate(['/auth/login']);
            return throwError(
              () => new Error('Session expired. Please log in again.')
            );
          })
        );
    } else {
      this.authService.clearStorage();
      this.router.navigate(['/auth/login']);
      return throwError(
        () => new Error('Session expired. Please log in again.')
      );
    }
  }
}
