import { Injectable } from '@angular/core';
import { ApiResponse, UserQuestProgress } from '@shared/models';
import { HttpService } from '@shared/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuestsService {
  constructor(private readonly httpService: HttpService) {}

  getTasksForServer(
    serverId: number
  ): Observable<ApiResponse<UserQuestProgress[]>> {
    return this.httpService.get<UserQuestProgress[]>(
      `/quests/server/${serverId}`
    );
  }

  startTaskOnServer(
    questId: number,
    serverId: number
  ): Observable<ApiResponse<UserQuestProgress>> {
    return this.httpService.post<UserQuestProgress>(
      `/quests/${questId}/start/${serverId}`,
      {}
    );
  }

  changeObjectiveProgress() {}

  createQuest() {}
}
