export interface GroupMessage {
  id: number;
  content: string;
  sender: { id: number; username: string; email: string };
  createdAt: string;
}
