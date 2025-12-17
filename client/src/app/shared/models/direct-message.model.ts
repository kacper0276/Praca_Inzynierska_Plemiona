export interface DirectMessage {
  id: number;
  content: string;
  isRead: boolean;
  sender: { id: number; username: string };
  receiver: { id: number; username: string };
  createdAt: string;
}
