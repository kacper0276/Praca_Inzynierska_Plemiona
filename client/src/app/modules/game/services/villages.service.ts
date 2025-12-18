import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/models';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpService } from '@shared/services';
import { MapVillage } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class VillagesService {
  constructor(private readonly http: HttpService) {}

  getMapData(
    serverId: number,
    x: number,
    y: number,
    range: number
  ): Observable<ApiResponse<MapVillage[]>> {
    let params = new HttpParams()
      .set('x', x.toString())
      .set('y', y.toString())
      .set('range', range.toString());

    return this.http.get<MapVillage[]>(`/villages/map/${serverId}`, {
      params,
    });
  }
}
