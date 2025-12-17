import { Injectable } from '@angular/core';
import { ApiResponse, ChatItem } from '@shared/models';
import { HttpService } from '@shared/services';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private readonly httpService: HttpService) {}

  fetchChatsForUser(): Observable<ApiResponse<ChatItem[]>> {
    return this.httpService.get<ChatItem[]>(`/chat/overview`);
  }
}
