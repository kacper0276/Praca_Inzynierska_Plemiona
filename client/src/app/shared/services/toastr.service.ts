import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast } from '../models/toast.model';
import { ToastType } from '../enums/toast-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ToastrService {
  private toastSubject = new Subject<Toast>();
  public toastState = this.toastSubject.asObservable();

  constructor() {}

  show(message: string, type: ToastType, duration: number = 5000) {
    this.toastSubject.next({ message, type, duration });
  }

  showSuccess(message: string, duration: number = 5000) {
    this.show(message, ToastType.Success, duration);
  }

  showError(message: string, duration: number = 5000) {
    this.show(message, ToastType.Error, duration);
  }

  showWarning(message: string, duration: number = 5000) {
    this.show(message, ToastType.Warning, duration);
  }

  showInfo(message: string, duration: number = 5000) {
    this.show(message, ToastType.Info, duration);
  }
}
