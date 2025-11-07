import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SharedModule } from '../../shared/shared.module';
import { ActivateAccountComponent } from './components/activate-account/activate-account.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ActivateAccountComponent],
  imports: [SharedModule],
  exports: [LoginComponent, RegisterComponent],
})
export class AuthModule {}
