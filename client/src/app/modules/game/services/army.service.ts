import { Injectable } from '@angular/core';
import { UnitType } from '@shared/enums';
import { ApiResponse, ArmyUnit } from '@shared/models';
import { HttpService } from '@shared/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArmyService {
  constructor(private readonly httpService: HttpService) {}

  getArmy(serverId: number): Observable<ApiResponse<ArmyUnit[]>> {
    return this.httpService.get<ArmyUnit[]>(`/army/${serverId}`);
  }

  recruitUnit(
    serverId: number,
    unitType: UnitType,
    amount: number
  ): Observable<ApiResponse<ArmyUnit>> {
    return this.httpService.post<ArmyUnit>('/army/recruit', {
      serverId,
      unitType,
      amount,
    });
  }

  upgradeUnit(
    serverId: number,
    unitType: UnitType
  ): Observable<ApiResponse<ArmyUnit>> {
    return this.httpService.post<ArmyUnit>('/army/upgrade', {
      serverId,
      unitType,
    });
  }
}
