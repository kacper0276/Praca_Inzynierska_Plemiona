import { Injectable } from '@angular/core';
import { ApiResponse, Quest, UserQuestProgress } from '@shared/models';
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

  getAllQuests(): Observable<ApiResponse<Quest[]>> {
    return this.httpService.get<Quest[]>('/quests');
  }

  changeObjectiveProgress() {}

  createQuest(questData: any): Observable<ApiResponse<Quest>> {
    return this.httpService.post<Quest>('/quests', questData);
  }

  updateQuest(id: number, questData: any): Observable<ApiResponse<Quest>> {
    return this.httpService.put<Quest>(`/quests/${id}`, questData);
  }

  deleteQuest(id: number): Observable<ApiResponse<void>> {
    return this.httpService.delete<void>(`/quests/${id}`);
  }
}
