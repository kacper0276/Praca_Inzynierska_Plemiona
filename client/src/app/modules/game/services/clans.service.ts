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

  getCurrentClan(serverId: number): Observable<ApiResponse<Clan | null>> {
    return this.httpService.get<Clan | null>(
      `/clans/get-user-clan-for-server/${serverId}`
    );
  }

  kickUserFromClan(
    clanId: number,
    userId: number
  ): Observable<ApiResponse<null>> {
    return this.httpService.delete<null>(
      `/clans/delete-member/${clanId}/${userId}`
    );
  }
}
