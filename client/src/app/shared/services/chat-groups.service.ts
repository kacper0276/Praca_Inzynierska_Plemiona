import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@shared/services/http.service';
import { ApiResponse, ChatItem, GroupMessage } from '@shared/models';
import { CreateChatGroup } from '@shared/interfaces/create-chat-group.interface';
import { CreateGroupMessage } from '@shared/interfaces/create-group-message.interface';

@Injectable({ providedIn: 'root' })
export class ChatGroupsService {
  constructor(private readonly httpService: HttpService) {}

  createGroup(payload: CreateChatGroup): Observable<ApiResponse<any>> {
    return this.httpService.post<any>('/chat-groups', payload);
  }

  getUserGroups(): Observable<ApiResponse<ChatItem[]>> {
    return this.httpService.get<ChatItem[]>('/chat-groups');
  }

  getGroupMessages(groupId: number): Observable<ApiResponse<GroupMessage[]>> {
    return this.httpService.get<GroupMessage[]>(
      `/chat-groups/${groupId}/messages`
    );
  }

  getChatByName(chatName: string): Observable<ApiResponse<ChatItem>> {
    return this.httpService.get<ChatItem>(
      `/chat-groups/by-chat-name/${chatName}`
    );
  }

  sendMessage(
    groupId: number,
    content: string
  ): Observable<ApiResponse<GroupMessage>> {
    const payload: CreateGroupMessage = { content };
    return this.httpService.post<GroupMessage>(
      `/chat-groups/${groupId}/messages`,
      payload
    );
  }
}
