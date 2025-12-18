import { Component } from '@angular/core';
import { SpinnerService } from '@shared/services';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  isVisible = this.spinnerService.spinnerVisible$;

  constructor(private readonly spinnerService: SpinnerService) {}
}
