import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from '@shared/services';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent implements OnInit {
  isVisible = false;
  message = '';
  private resolve?: (value: boolean) => void;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.confirmationService.confirmationState$.subscribe((state) => {
      this.message = state.message;
      this.resolve = state.resolve;
      this.isVisible = true;
    });
  }

  onConfirm(): void {
    if (this.resolve) {
      this.resolve(true);
    }
    this.isVisible = false;
  }

  onCancel(): void {
    if (this.resolve) {
      this.resolve(false);
    }
    this.isVisible = false;
  }
}
