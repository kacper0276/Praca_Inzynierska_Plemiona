import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { GameComponent } from './components/game/game.component';

@NgModule({
  declarations: [
    GameComponent
  ],
  imports: [SharedModule],
})
export class GameModule {}
