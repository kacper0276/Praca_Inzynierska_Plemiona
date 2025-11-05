import { ToastType } from '../enums/toast-type.enum';

export interface Toast {
  message: string;
  type: ToastType;
  duration?: number;
}
