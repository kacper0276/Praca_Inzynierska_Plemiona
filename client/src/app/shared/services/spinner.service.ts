import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private _spinnerVisible = new BehaviorSubject<boolean>(false);
  spinnerVisible$ = this._spinnerVisible.asObservable();

  constructor() {}

  show(): void {
    this._spinnerVisible.next(true);
  }

  hide(): void {
    this._spinnerVisible.next(false);
  }
}
