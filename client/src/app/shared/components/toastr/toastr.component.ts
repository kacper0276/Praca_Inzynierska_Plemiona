import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { trigger, transition, animate, style } from '@angular/animations';
import { ToastType } from '@shared/enums';
import { Toast } from '@shared/models';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-toastr',
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss'],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ToastrComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastrService: ToastrService) {}

  ngOnInit() {
    this.subscription = this.toastrService.toastState.subscribe((toast) => {
      this.toasts.push(toast);
      setTimeout(() => this.removeToast(toast), toast.duration);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCssClass(toast: Toast): string {
    if (!toast) {
      return '';
    }

    switch (toast.type) {
      case ToastType.Success:
        return 'toast-success';
      case ToastType.Error:
        return 'toast-error';
      case ToastType.Warning:
        return 'toast-warning';
      case ToastType.Info:
        return 'toast-info';
    }
  }

  removeToast(toastToRemove: Toast) {
    this.toasts = this.toasts.filter((toast) => toast !== toastToRemove);
  }
}
