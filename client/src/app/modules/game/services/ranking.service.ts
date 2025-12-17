import { Injectable } from '@angular/core';
import { ApiResponse, PaginatedResult, Ranking } from '@shared/models';
import { HttpService } from '@shared/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RankingService {
  constructor(private readonly httpService: HttpService) {}

  getRankingForServer(
    serverName: string,
    page: number = 1,
    limit: number = 10
  ): Observable<ApiResponse<PaginatedResult<Ranking>>> {
    return this.httpService.get<PaginatedResult<Ranking>>(
      `/ranking/for-server/${serverName}`,
      { params: { page, limit } }
    );
  }
}
