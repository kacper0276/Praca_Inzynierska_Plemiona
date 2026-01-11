import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ActivateAccountComponent } from './components/activate-account/activate-account.component';
import { SharedModule } from '@shared/shared.module';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ActivateAccountComponent, ForgotPasswordComponent, ResetPasswordComponent],
  imports: [SharedModule],
  exports: [LoginComponent, RegisterComponent],
})
export class AuthModule {}
