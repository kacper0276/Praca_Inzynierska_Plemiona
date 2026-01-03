import { NgModule } from '@angular/core';
import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { AdminPanelComponent } from './admin-panel.component';
import { UserPanelComponent } from './components/user-panel/user-panel.component';
import { BuildingPanelComponent } from './components/building-panel/building-panel.component';
import { ResourcePanelComponent } from './components/resource-panel/resource-panel.component';
import { ReportPanelComponent } from './components/report-panel/report-panel.component';
import { ClanPanelComponent } from './components/clan-panel/clan-panel.component';
import { SharedModule } from '@shared/shared.module';
import { QuestPanelComponent } from './components/quest-panel/quest-panel.component';

@NgModule({
  declarations: [
    AdminPanelComponent,
    UserPanelComponent,
    BuildingPanelComponent,
    ResourcePanelComponent,
    ReportPanelComponent,
    ClanPanelComponent,
    QuestPanelComponent,
  ],
  imports: [AdminPanelRoutingModule, SharedModule],
})
export class AdminPanelModule {}
