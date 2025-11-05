import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from '../../../../shared/services/toastr.service';
import { TranslateService } from '@ngx-translate/core';

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
    private readonly translateService: TranslateService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginCredentials = this.loginForm.getRawValue();

      this.authService.login(loginCredentials).subscribe({
        next: (res) => {
          console.log(res);
          this.toastr.showSuccess(
            this.translateService.instant('auth.successfully-logged-in')
          );
          this.router.navigate(['/game/village/kacper0276@op.pl']);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
