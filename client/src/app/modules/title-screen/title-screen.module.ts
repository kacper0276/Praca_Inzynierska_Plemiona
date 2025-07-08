import { NgModule } from '@angular/core';
import { TitleScreenComponent } from './title-screen.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [TitleScreenComponent],
  imports: [SharedModule],
  exports: [TitleScreenComponent],
})
export class TitleScreenModule {}
