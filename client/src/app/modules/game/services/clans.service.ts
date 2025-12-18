import { Injectable } from '@angular/core';
import { HttpService } from '@shared/services';
import { CreateClan } from '../interfaces';
import { Observable } from 'rxjs';
import { ApiResponse, Clan } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class ClansService {
  constructor(private readonly httpService: HttpService) {}

  createClan(newClan: CreateClan): Observable<ApiResponse<Clan>> {
    return this.httpService.post<Clan>('/clans', newClan);
  }
}
