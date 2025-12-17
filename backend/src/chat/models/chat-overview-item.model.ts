export class ChatOverviewDto {
  id: number;
  type: 'dm' | 'group';
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageDate: Date;
  senderName?: string;
  isRead: boolean;
}
