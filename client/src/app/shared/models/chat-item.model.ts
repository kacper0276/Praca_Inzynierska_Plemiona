export interface ChatItem {
  id: number;
  type: 'dm' | 'group';
  name: string;
  avatar: string;
  lastMessageDate: Date;
  lastMessage: string;
  time: string;
}
