import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@shared/services/http.service';
import { CreateDirectMessage } from '@shared/interfaces/create-direct-message.interface';
import { ApiResponse, DirectMessage } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class DirectMessagesService {
  constructor(private readonly httpService: HttpService) {}

  sendDirectMessage(
    receiverId: number,
    content: string
  ): Observable<ApiResponse<DirectMessage>> {
    const payload: CreateDirectMessage = {
      receiverId,
      content,
    };
    return this.httpService.post<DirectMessage>('/direct-messages', payload);
  }

  getConversation(friendId: number): Observable<ApiResponse<DirectMessage[]>> {
    return this.httpService.get<DirectMessage[]>(
      `/direct-messages/conversation/${friendId}`
    );
  }
}
