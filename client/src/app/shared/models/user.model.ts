import { UserRole } from '../enums/user-role.enum';
import { BaseModel } from './base.model';

export interface User extends BaseModel {
  email: string;
  login: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  profileImage?: string;
  backgroundImage?: string;
  isActive: boolean;
  isOnline: boolean;
  bio: string;
}
