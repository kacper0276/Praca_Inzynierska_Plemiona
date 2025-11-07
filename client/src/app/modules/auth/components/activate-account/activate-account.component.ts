import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '../../../../shared/services/toastr.service';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss',
})
export class ActivateAccountComponent {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  constructor(
    private readonly translateService: TranslateService,
    private readonly titleService: Title,
    private readonly toastrService: ToastrService
  ) {
    this.titleService.setTitle(
      this.translateService.instant('activate-account')
    );
  }

  onKeyUp(event: KeyboardEvent, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    const nextInput = this.codeInputs.toArray()[index + 1];

    if (inputElement.value.length === 1 && nextInput) {
      nextInput.nativeElement.focus();
    }

    if (
      event.key === 'Backspace' &&
      inputElement.value.length === 0 &&
      index > 0
    ) {
      this.codeInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onActivate(): void {
    let code = '';
    this.codeInputs.forEach((input) => {
      code += input.nativeElement.value;
    });

    if (code.length === 6) {
      console.log('Wprowadzony kod aktywacyjny:', code);
    } else {
      console.error('Kod musi mieć 6 znaków.');
    }
  }
}
