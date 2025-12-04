import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../game/services/reports.service';
import { ActionEvent } from '@shared/interfaces/action-event.interface';
import { ColumnDefinition } from '@shared/interfaces/column-definition.interface';
import { ConfirmationService } from '@shared/services/confirmation.service';
import { Report } from '@shared/models';

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
    { key: 'isResolved', header: 'Status' },
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
    const index = this.reports.findIndex((r) => r.id === updatedReport.id);
    if (index > -1) {
      this.reports[index] = updatedReport;
    }
    this.closeEditModal();
  }

  async onDeleteReport(reportToDelete: Report): Promise<void> {
    const result = await this.confirmationService.confirm(
      `Czy na pewno chcesz usunąć zgłoszenie od ${reportToDelete.reporter.email}?`
    );

    if (result) {
      console.log('Usuwanie potwierdzone:', reportToDelete);
      this.reports = this.reports.filter((r) => r.id !== reportToDelete.id);
      this.closeEditModal();
    } else {
      console.log('Usuwanie anulowane.');
    }
  }
}
