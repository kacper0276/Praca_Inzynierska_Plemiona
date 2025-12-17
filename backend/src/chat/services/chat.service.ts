import { Injectable } from '@nestjs/common';
import { ChatGroupsRepository } from '../repositories/chat-groups.repository';
import { DirectMessagesRepository } from '../repositories/direct-messages.repository';
import { ChatOverviewDto } from '../models/chat-overview-item.model';

@Injectable()
export class ChatService {
  constructor(
    private readonly groupsRepo: ChatGroupsRepository,
    private readonly dmsRepo: DirectMessagesRepository,
  ) {}

  async getOverview(userId: number): Promise<ChatOverviewDto[]> {
    const groups = await this.groupsRepo.findUserGroupsWithLastMessage(userId);

    const groupDtos: ChatOverviewDto[] = groups.map((g) => {
      const lastMsg = g.messages?.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];
      return {
        id: g.id,
        type: 'group',
        name: g.name,
        avatar: g.image,
        lastMessage: lastMsg ? lastMsg.content : 'Utworzono grupę',
        lastMessageDate: lastMsg ? lastMsg.createdAt : (g['createdAt'] as Date),
        senderName: lastMsg?.sender?.login || '',
        isRead: true,
      };
    });

    const allDms = await this.dmsRepo.findUserAllMessages(userId);
    const dmMap = new Map<number, ChatOverviewDto>();

    for (const dm of allDms) {
      const isMeSender = dm.sender.id === userId;
      const otherUser = isMeSender ? dm.receiver : dm.sender;

      if (!dmMap.has(otherUser.id)) {
        dmMap.set(otherUser.id, {
          id: otherUser.id,
          type: 'dm',
          name:
            `${otherUser.firstName} ${otherUser.lastName}` ||
            otherUser.login ||
            otherUser.email,
          avatar: null,
          lastMessage: dm.content,
          lastMessageDate: dm.createdAt,
          senderName: isMeSender ? 'Ty' : otherUser.login,
          isRead: isMeSender ? true : dm.isRead,
        });
      }
    }

    return [...groupDtos, ...Array.from(dmMap.values())].sort(
      (a, b) =>
        new Date(b.lastMessageDate).getTime() -
        new Date(a.lastMessageDate).getTime(),
    );
  }
}
