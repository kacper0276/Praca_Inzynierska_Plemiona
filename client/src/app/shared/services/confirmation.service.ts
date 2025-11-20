import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfirmationState } from '../interfaces/confirmation-state.interface';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private confirmationSubject = new Subject<ConfirmationState>();
  public confirmationState$ = this.confirmationSubject.asObservable();

  public confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationSubject.next({
        message,
        resolve,
      });
    });
  }
}
