import { Component, EventEmitter, Output } from '@angular/core';
import { CreateReport } from '@modules/game/interfaces';
import { ReportsService } from '@modules/game/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.scss'],
})
export class BugReportComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  bug: CreateReport = {
    title: '',
    content: '',
    targetUser: null,
  };

  bugSubmitted: boolean = false;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService
  ) {}

  close() {
    this.closed.emit();
  }

  submit(form: any) {
    if (!form || !form.valid) return;

    const reportData: CreateReport = {
      ...this.bug,
      targetUser: this.bug.targetUser === '' ? null : this.bug.targetUser,
    };

    this.reportsService.generateReport(reportData).subscribe({
      next: (res) => {
        this.closed.emit();
        this.toastrService.showSuccess(
          this.translateService.instant('bugModal.TOASTR_SUCCESS')
        );
      },
      error: (err) => {
        this.toastrService.showError(err.error.message[0]);
      },
      complete: () => {
        this.bugSubmitted = true;
        this.submitted.emit();
      },
    });
  }
}
