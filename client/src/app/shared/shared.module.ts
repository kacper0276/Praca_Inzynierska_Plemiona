import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { OrderByPipe } from './pipes/order-by.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ModalComponent } from './components/modal/modal.component';
import { BuildingComponent } from './components/building/building.component';
import { RadialMenuComponent } from './components/radial-menu/radial-menu.component';

@NgModule({
  declarations: [
    OrderByPipe,
    TimeAgoPipe,
    TruncatePipe,
    SpinnerComponent,
    ModalComponent,
    BuildingComponent,
    RadialMenuComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslateModule,
    RouterModule,
  ],
  exports: [
    CommonModule,
    MatIconModule,
    MatIconModule,
    TranslateModule,
    RouterModule,
    SpinnerComponent,
    ReactiveFormsModule,
    FormsModule,
    ModalComponent,
    BuildingComponent,
    RadialMenuComponent,
  ],
})
export class SharedModule {}
