import { Injectable } from '@angular/core';
import { ApiResponse, Ranking } from '@shared/models';
import { PaginatedResult } from '@shared/models/paginated-response.model';
import { HttpService } from '@shared/services/http.service';
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
