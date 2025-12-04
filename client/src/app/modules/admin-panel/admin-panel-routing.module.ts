import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin-panel.component';
import { UserPanelComponent } from './components/user-panel/user-panel.component';
import { BuildingPanelComponent } from './components/building-panel/building-panel.component';
import { ResourcePanelComponent } from './components/resource-panel/resource-panel.component';
import { ReportPanelComponent } from './components/report-panel/report-panel.component';
import { ClanPanelComponent } from './components/clan-panel/clan-panel.component';
import { adminGuard } from '@shared/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminPanelComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: 'users',
        component: UserPanelComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'buildings',
        component: BuildingPanelComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'resources',
        component: ResourcePanelComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'reports',
        component: ReportPanelComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'guilds',
        component: ClanPanelComponent,
        canActivate: [adminGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPanelRoutingModule {}
