import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.showSuccess(
          this.translate.instant('auth.forgot_password.SUCCESS')
        );
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        this.translate.instant('auth.forgot_password.ERROR');
      },
    });
  }
}
