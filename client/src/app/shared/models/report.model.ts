import { User } from './user.model';

export interface Report {
  id?: number;
  reporter: User;
  targetUser?: User;
  content: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolver?: User;
}
