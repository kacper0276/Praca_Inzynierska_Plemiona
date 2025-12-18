import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './components/game/game.component';
import { GridComponent } from './components/grid/grid.component';
import { ChatComponent } from './components/chat/chat.component';
import { MapComponent } from './components/map/map.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GameRoutingModule } from './game-routing.module';
import { RankingComponent } from './components/ranking/ranking.component';
import { BuildingDetailsPopupComponent } from './components/grid/components/building-details-popup/building-details-popup.component';
import { BuildModalComponent } from './components/build/build-modal.component';
import { UpgradeModalComponent } from './components/upgrade/upgrade-modal.component';
import { ClanCreateComponent } from './components/clan-create/clan-create.component';
import { ArmyComponent } from './components/army/army.component';
import { InvitesComponent } from './components/invites/invites.component';
import { SharedModule } from '@shared/shared.module';
import { TasksComponent } from './components/tasks/tasks.component';

@NgModule({
  declarations: [
    GameComponent,
    GridComponent,
    ChatComponent,
    MapComponent,
    SideMenuComponent,
    RankingComponent,
    BuildingDetailsPopupComponent,
    BuildModalComponent,
    UpgradeModalComponent,
    ClanCreateComponent,
    ArmyComponent,
    InvitesComponent,
    TasksComponent,
  ],
  imports: [SharedModule, FormsModule, DragDropModule, GameRoutingModule],
})
export class GameModule {}
