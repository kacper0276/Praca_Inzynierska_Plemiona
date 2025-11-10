import { ToastType } from '../enums/toast-type.enum';
import { BaseModel } from './base.model';

export interface Toast extends BaseModel {
  message: string;
  type: ToastType;
  duration?: number;
}
