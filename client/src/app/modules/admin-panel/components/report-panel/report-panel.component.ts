import { Component, OnInit } from '@angular/core';
import { ReportsService } from '@modules/game/services';
import { ColumnDefinition, ActionEvent } from '@shared/interfaces';
import { Report } from '@shared/models';
import { ConfirmationService } from '@shared/services';

@Component({
  selector: 'app-report-panel',
  templateUrl: './report-panel.component.html',
  styleUrl: './report-panel.component.scss',
})
export class ReportPanelComponent implements OnInit {
  reports: Report[] = [];
  reportColumns: ColumnDefinition[] = [
    {
      key: 'reporter',
      header: 'Zgłaszający (e-mxail)',
      editField: 'email',
      isReadOnly: true,
    },
    {
      key: 'targetUser',
      header: 'Zgłoszony (e-mail)',
      editField: 'email',
      isReadOnly: true,
    },
    { key: 'content', header: 'Treść' },
    { key: 'isResolved', header: 'Status (Czy rozwiązano)' },
    // { key: 'actions', header: 'Akcje', isAction: true },
  ];

  isModalOpen = false;
  selectedReport: Report | null = null;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.reportsService.getAllReports().subscribe({
      next: (res) => {
        this.reports = res.data;
      },
    });
  }

  formatReportData(item: Report, columnKey: string): any {
    switch (columnKey) {
      case 'reporter':
        return item.reporter ? item.reporter.email : 'Brak';
      case 'targetUser':
        return item.targetUser ? item.targetUser.email : 'Brak';
      case 'isResolved':
        return item.isResolved ? 'Rozwiązany' : 'Oczekujący';
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
    console.log('Zapisywanie zmian:', updatedReport);
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
      `Czy na pewno chcesz usunąć zgłoszenie od ${reportToDelete.reporter.email}?`
    );

    if (result) {
      this.reportsService.deleteReport(reportToDelete.id ?? -1).subscribe({
        next: () => {
          this.reports = this.reports.filter((r) => r.id !== reportToDelete.id);
        },
      });

      this.closeEditModal();
    } else {
      console.log('Usuwanie anulowane.');
    }
  }
}
