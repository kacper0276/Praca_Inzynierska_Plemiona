import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from './components/grid/grid.component';
import { MapComponent } from './components/map/map.component';
import { BarracksComponent } from './components/barracks/barracks.component';
import { ChatComponent } from './components/chat/chat.component';
import { GameComponent } from './components/game/game.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { ClanCreateComponent } from './components/clan-create/clan-create.component';

const gameRoutes: Routes = [
  {
    path: '',
    component: GameComponent,
    children: [
      { path: 'village', component: GridComponent },
      { path: 'map', component: MapComponent },
      { path: 'barracks', component: BarracksComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'ranking', component: RankingComponent },
      { path: 'clan', component: ClanCreateComponent },
      { path: '', redirectTo: 'village', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(gameRoutes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
