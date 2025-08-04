import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { GameComponent } from './components/game/game.component';
import { GridComponent } from './components/grid/grid.component';
import { ChatComponent } from './components/chat/chat.component';
import { MapComponent } from './components/map/map.component';
import { BarracksComponent } from './components/barracks/barracks.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GameRoutingModule } from './game-routing.module';

@NgModule({
  declarations: [
    GameComponent,
    GridComponent,
    ChatComponent,
    MapComponent,
    BarracksComponent,
  ],
  imports: [SharedModule, DragDropModule, GameRoutingModule],
})
export class GameModule {}
