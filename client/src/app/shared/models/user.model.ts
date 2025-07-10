import { Role } from '../enums/role.enum';
import { BaseModel } from './base.model';

export interface User extends BaseModel {
  email: string;
  login: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  profileImage?: string;
  backgroundImage?: string;
  isActive: boolean;
  isOnline: boolean;
  bio: string;
}
