import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { GameComponent } from './components/game/game.component';
import { GridComponent } from './components/grid/grid.component';
import { ChatComponent } from './components/chat/chat.component';
import { MapComponent } from './components/map/map.component';
import { BarracksComponent } from './components/barracks/barracks.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GameRoutingModule } from './game-routing.module';
import { RankingComponent } from './components/ranking/ranking.component';
import { BuildingDetailsPopupComponent } from './components/grid/components/building-details-popup/building-details-popup.component';

@NgModule({
  declarations: [
    GameComponent,
    GridComponent,
    ChatComponent,
    MapComponent,
    BarracksComponent,
    SideMenuComponent,
    RankingComponent,
    BuildingDetailsPopupComponent,
  ],
  imports: [SharedModule, DragDropModule, GameRoutingModule],
})
export class GameModule {}
