import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Report } from '@shared/models';
import { CreateReport } from '../interfaces';
import { HttpService } from '@shared/services';

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
