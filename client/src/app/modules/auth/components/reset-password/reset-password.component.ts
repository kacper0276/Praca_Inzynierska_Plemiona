import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordData } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  emailFromRoute: string = '';
  tokenFromRoute: string = '';
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.tokenFromRoute = this.route.snapshot.queryParams['token'] || '';
    this.emailFromRoute = this.route.snapshot.queryParams['email'] || '';

    if (!this.tokenFromRoute) {
      this.toastr.showError('Brak tokena resetującego.');
      this.router.navigate(['/login']);
    }

    this.resetPasswordForm = this.fb.group({
      email: [{ value: this.emailFromRoute, disabled: true }],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) return;

    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword =
      this.resetPasswordForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.translate.instant('auth.reset_password.ERRORS.PASSWORDS_NOT_MATCH');
      return;
    }

    this.isLoading = true;

    const payload: ResetPasswordData = {
      token: this.tokenFromRoute,
      password: password,
      repeatedPassword: confirmPassword,
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.translate.instant('auth.reset_password.SUCCESS');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.showError(
          this.translate.instant('auth.reset_password.ERRORS.TOKEN_INVALID')
        );
      },
    });
  }
}
