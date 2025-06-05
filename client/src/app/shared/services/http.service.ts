import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../models';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private readonly http: HttpClient) {}

  get<T>(url: string, options?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${environment.apiUrl}${url}`, {
      observe: 'body',
      responseType: 'json',
      ...options,
    } as {
      observe: 'body';
      responseType: 'json';
    });
  }

  post<T>(url: string, body: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${environment.apiUrl}${url}`, body, {
      observe: 'body',
      responseType: 'json',
      ...options,
    } as {
      observe: 'body';
      responseType: 'json';
    });
  }

  put<T>(url: string, body: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${environment.apiUrl}${url}`, body, {
      observe: 'body',
      responseType: 'json',
      ...options,
    } as {
      observe: 'body';
      responseType: 'json';
    });
  }

  delete<T>(url: string, options?: any): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${environment.apiUrl}${url}`, {
      observe: 'body',
      responseType: 'json',
      ...options,
    } as {
      observe: 'body';
      responseType: 'json';
    });
  }

  patch<T>(url: string, body: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(
      `${environment.apiUrl}${url}`,
      body,
      {
        observe: 'body',
        responseType: 'json',
        ...options,
      } as {
        observe: 'body';
        responseType: 'json';
      }
    );
  }
}
