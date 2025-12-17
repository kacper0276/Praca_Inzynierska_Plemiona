import { Injectable } from '@angular/core';
import { CreateReport } from '../interfaces/create-report.interface';
import { Observable } from 'rxjs';
import { HttpService } from '@shared/services/http.service';
import { ApiResponse, Report } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private readonly httpService: HttpService) {}

  generateReport(newReport: CreateReport): Observable<ApiResponse<Report>> {
    return this.httpService.post<Report>('/reports', newReport);
  }

  getAllReports(): Observable<ApiResponse<Report[]>> {
    return this.httpService.get<Report[]>('/reports');
  }

  updateReport(
    reportId: number,
    resolvedStatus: boolean
  ): Observable<ApiResponse<Report>> {
    return this.httpService.patch<Report>(
      `/reports/${reportId}/change-status`,
      {
        resolvedStatus,
      }
    );
  }

  deleteReport(reportId: number): Observable<ApiResponse<null>> {
    return this.httpService.delete<null>(`/reports/${reportId}`);
  }
}
