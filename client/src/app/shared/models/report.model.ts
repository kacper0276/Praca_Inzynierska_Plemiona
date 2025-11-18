import { User } from './user.model';

export interface Report {
  reporter: User;
  targetUser?: User;
  content: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolver?: User;
}
