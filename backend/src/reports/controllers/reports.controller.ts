import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { Report } from '../entities/report.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() payload: Partial<Report>): Promise<Report> {
    const reporterId = (payload as any).reporter?.id || null;
    return this.reportsService.createReport(reporterId, payload);
  }

  @Get()
  async list(
    @Query('reporterId') reporterId?: string,
    @Query('targetId') targetId?: string,
  ): Promise<Report[]> {
    const filter: any = {};
    if (reporterId) filter.reporterId = Number(reporterId);
    if (targetId) filter.targetId = Number(targetId);
    return this.reportsService.listReports(filter);
  }

  @Put(':id/resolve')
  async resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body('resolver') resolver?: any,
  ): Promise<Report> {
    const resolverId = resolver?.id || null;
    return this.reportsService.resolveReport(id, resolverId);
  }
}
