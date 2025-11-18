import { Component, EventEmitter, Output } from '@angular/core';
import { ReportsService } from '../../../modules/game/services/reports.service';
import { CreateReport } from '../../../modules/game/interfaces/create-report.interface';
import { ToastrService } from '../../services/toastr.service';

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
    private readonly toastrService: ToastrService
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
        this.toastrService.showSuccess('Wysłano zgłoszenie');
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
