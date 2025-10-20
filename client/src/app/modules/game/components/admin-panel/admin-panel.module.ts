import { NgModule } from '@angular/core';
import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { SharedModule } from '../../../../shared/shared.module';
import { AdminPanelComponent } from './admin-panel.component';

@NgModule({
  declarations: [AdminPanelComponent],
  imports: [AdminPanelRoutingModule, SharedModule],
})
export class AdminPanelModule {}
