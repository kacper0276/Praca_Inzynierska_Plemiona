import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@modules/auth/services';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService,
    private readonly titleService: Title
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.titleService.setTitle(this.translateService.instant('Logowanie'));
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginCredentials = this.loginForm.getRawValue();

      this.authService.login(loginCredentials).subscribe({
        next: (res) => {
          this.toastr.showSuccess(
            this.translateService.instant('auth.successfully-logged-in')
          );
          this.router.navigate([`/game/village/${res.data.user.email}`]);
        },
        error: (err) => {
          this.toastr.showError(err.error.message);
        },
      });
    }
  }
}
