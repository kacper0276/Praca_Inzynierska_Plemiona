import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword: boolean = false;
  showRepeatedPassword: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService,
    private readonly titleService: Title,
    private readonly authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      login: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatedPassword: ['', Validators.required],
      firstName: [''],
      lastName: [''],
    });

    this.titleService.setTitle(
      this.translateService.instant('auth.register.TITLE')
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRepeatedPasswordVisibility(): void {
    this.showRepeatedPassword = !this.showRepeatedPassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.registerUser(this.registerForm.value).subscribe({
        next: (res) => {
          this.toastr.showSuccess(
            this.translateService.instant('auth.register.SUCCESS')
          );
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const errorMsg =
            err.error?.message ||
            this.translateService.instant('auth.register.ERROR');
          this.toastr.showError(errorMsg);
        },
      });
    }
  }
}
