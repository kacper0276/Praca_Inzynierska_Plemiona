import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from './components/grid/grid.component';
import { MapComponent } from './components/map/map.component';
import { ChatComponent } from './components/chat/chat.component';
import { GameComponent } from './components/game/game.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { ArmyComponent } from './components/army/army.component';
import { InvitesComponent } from './components/invites/invites.component';
import { adminGuard } from '@shared/guards/admin.guard';
import { TasksComponent } from './components/tasks/tasks.component';
import { authGuard } from '@shared/guards/auth.guard';
import { ClanComponent } from './components/clan/clan.component';

const gameRoutes: Routes = [
  {
    path: '',
    component: GameComponent,
    children: [
      {
        path: 'village/:userEmail',
        component: GridComponent,
        canActivate: [authGuard],
      },
      { path: 'map', component: MapComponent, canActivate: [authGuard] },
      { path: 'army', component: ArmyComponent, canActivate: [authGuard] },
      { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
      {
        path: 'ranking',
        component: RankingComponent,
        canActivate: [authGuard],
      },
      {
        path: 'clan',
        component: ClanComponent,
        canActivate: [authGuard],
      },
      {
        path: 'admin-panel',
        loadChildren: () =>
          import('../admin-panel/admin-panel.module').then(
            (m) => m.AdminPanelModule
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.module').then((m) => m.ProfileModule),
        canActivate: [authGuard],
      },
      {
        path: 'invitations',
        component: InvitesComponent,
        canActivate: [authGuard],
      },
      { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
      {
        path: '',
        redirectTo: 'village',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(gameRoutes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
