import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { AppProfileComponent } from './app-profile.component';

const routes: Routes = [
  {
    path: '',
    component: AppProfileComponent,
    children: [
      { path: 'edit', component: EditProfileComponent },
      { path: ':userEmail', component: ProfileComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
