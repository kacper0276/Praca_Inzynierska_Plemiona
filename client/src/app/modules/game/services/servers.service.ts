import { Injectable } from '@angular/core';
import { ApiResponse, Server } from '@shared/models';
import { HttpService } from '@shared/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServersService {
  constructor(private readonly httpService: HttpService) {}

  getAll(): Observable<ApiResponse<Server[]>> {
    return this.httpService.get<Server[]>(`/servers`);
  }
}
