import { Injectable } from '@angular/core';
import { ApiResponse, BuildingData } from '@shared/models';
import { HttpService } from '@shared/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  constructor(private readonly httpService: HttpService) {}

  getAllBuildings(): Observable<ApiResponse<BuildingData[]>> {
    return this.httpService.get<BuildingData[]>(`/buildings`);
  }
}
