import { User } from '@shared/models';

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
