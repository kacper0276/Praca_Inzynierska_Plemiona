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
import { BugReportComponent } from './components/bug-report/bug-report.component';
import { MultiSelectComponent } from './components/multi-select/multi-select.component';
import { ToastrComponent } from './components/toastr/toastr.component';
import { SetTitleDirective } from './directives/set-title.directive';

@NgModule({
  declarations: [
    OrderByPipe,
    TimeAgoPipe,
    TruncatePipe,
    SpinnerComponent,
    ModalComponent,
    BuildingComponent,
    RadialMenuComponent,
    BugReportComponent,
    MultiSelectComponent,
    ToastrComponent,
    SetTitleDirective,
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
    BugReportComponent,
    MultiSelectComponent,
    ToastrComponent,
    SetTitleDirective,
  ],
})
export class SharedModule {}
