import { Component, OnInit } from '@angular/core';
import { ReportsService } from '@modules/game/services';
import { ColumnDefinition, ActionEvent } from '@shared/interfaces';
import { Report } from '@shared/models';
import { ConfirmationService } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-report-panel',
  templateUrl: './report-panel.component.html',
  styleUrl: './report-panel.component.scss',
})
export class ReportPanelComponent implements OnInit {
  reports: Report[] = [];
  reportColumns: ColumnDefinition[] = [];

  isModalOpen = false;
  selectedReport: Report | null = null;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initColumns();
    this.reportsService.getAllReports().subscribe({
      next: (res) => {
        this.reports = res.data;
      },
    });
  }

  private initColumns(): void {
    this.reportColumns = [
      {
        key: 'reporter',
        header: this.translate.instant('admin.reports.REPORTER'),
        editField: 'email',
        isReadOnly: true,
      },
      {
        key: 'targetUser',
        header: this.translate.instant('admin.reports.TARGET'),
        editField: 'email',
        isReadOnly: true,
      },
      {
        key: 'content',
        header: this.translate.instant('admin.reports.CONTENT'),
      },
      {
        key: 'isResolved',
        header: this.translate.instant('admin.reports.STATUS'),
      },
    ];
  }

  formatReportData(item: Report, columnKey: string): any {
    switch (columnKey) {
      case 'reporter':
        return item.reporter ? item.reporter.email : 'Brak';
      case 'targetUser':
        return item.targetUser ? item.targetUser.email : 'Brak';
      case 'isResolved':
        return item.isResolved
          ? this.translate.instant('admin.reports.STATUS_RESOLVED')
          : this.translate.instant('admin.reports.STATUS_PENDING');
      default:
        return (item as any)[columnKey];
    }
  }

  handleReportAction(event: ActionEvent): void {
    this.selectedReport = event.item as Report;
    this.isModalOpen = true;
  }

  closeEditModal(): void {
    this.isModalOpen = false;
    this.selectedReport = null;
  }

  onSaveReport(updatedReport: Report): void {
    this.reportsService
      .updateReport(updatedReport.id ?? -1, updatedReport.isResolved)
      .subscribe({
        next: () => {
          const index = this.reports.findIndex(
            (r) => r.id === updatedReport.id
          );
          if (index > -1) {
            this.reports[index] = updatedReport;
          }
        },
      });

    this.closeEditModal();
  }

  async onDeleteReport(reportToDelete: Report): Promise<void> {
    const result = await this.confirmationService.confirm(
      this.translate.instant('admin.reports.DELETE_CONFIRM', {
        email: reportToDelete.reporter.email,
      })
    );

    if (result) {
      this.reportsService.deleteReport(reportToDelete.id ?? -1).subscribe({
        next: () => {
          this.reports = this.reports.filter((r) => r.id !== reportToDelete.id);
        },
      });

      this.closeEditModal();
    }
  }
}
