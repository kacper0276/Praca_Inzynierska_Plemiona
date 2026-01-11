import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivateAccountComponent } from '@modules/auth/components/activate-account/activate-account.component';
import { ForgotPasswordComponent } from '@modules/auth/components/forgot-password/forgot-password.component';
import { LoginComponent } from '@modules/auth/components/login/login.component';
import { RegisterComponent } from '@modules/auth/components/register/register.component';
import { ResetPasswordComponent } from '@modules/auth/components/reset-password/reset-password.component';
import { TitleScreenComponent } from '@modules/title-screen/title-screen.component';
import { noAuthGuard } from '@shared/guards/no-auth.guard';

const routes: Routes = [
  { path: '', component: TitleScreenComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: 'activate-account',
    component: ActivateAccountComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: 'game',
    loadChildren: () =>
      import('./modules/game/game.module').then((m) => m.GameModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./modules/profile/profile.module').then((m) => m.ProfileModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
