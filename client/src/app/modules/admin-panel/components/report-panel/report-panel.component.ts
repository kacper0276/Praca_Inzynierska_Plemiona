import { Component, OnInit } from '@angular/core';
import { Report } from '../../../../shared/models';
import { ReportsService } from '../../../game/services/reports.service';

@Component({
  selector: 'app-report-panel',
  templateUrl: './report-panel.component.html',
  styleUrl: './report-panel.component.scss',
})
export class ReportPanelComponent implements OnInit {
  reports: Report[] = [];

  constructor(private readonly reportsService: ReportsService) {}

  ngOnInit(): void {
    this.reportsService.getAllReports().subscribe({
      next: (res) => {
        this.reports = res.data;
      },
    });
  }
}
