import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { CreateReport } from '../interfaces/create-report.interface';
import { Observable } from 'rxjs';
import { ApiResponse, Report } from '../../../shared/models';

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
}
