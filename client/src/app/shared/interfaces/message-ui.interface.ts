export interface MessageUi {
  id: number;
  content: string;
  isMe: boolean;
  time: string;
  senderName: string;
  senderAvatar?: string;
}
