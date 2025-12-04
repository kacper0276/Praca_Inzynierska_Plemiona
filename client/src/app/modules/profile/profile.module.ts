import { NgModule } from '@angular/core';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { AppProfileComponent } from './app-profile.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ProfileComponent, EditProfileComponent, AppProfileComponent],
  imports: [SharedModule, ProfileRoutingModule],
})
export class ProfileModule {}
