import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { GameComponent } from './components/game/game.component';
import { GridComponent } from './components/grid/grid.component';

@NgModule({
  declarations: [GameComponent, GridComponent],
  imports: [SharedModule],
})
export class GameModule {}
