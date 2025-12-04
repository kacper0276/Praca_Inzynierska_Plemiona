import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ActivateAccountComponent } from './components/activate-account/activate-account.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ActivateAccountComponent],
  imports: [SharedModule],
  exports: [LoginComponent, RegisterComponent],
})
export class AuthModule {}
