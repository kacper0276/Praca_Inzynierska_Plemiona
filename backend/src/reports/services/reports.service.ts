import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportsRepository } from '../repositories/reports.repository';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async createReport(
    reporterId: number | null,
    payload: Partial<Report>,
  ): Promise<Report> {
    const entity = this.reportsRepository.create({
      ...payload,
      reporter: reporterId ? ({ id: reporterId } as any) : null,
    });
    return this.reportsRepository.save(entity as Report);
  }

  async listReports(filter?: {
    reporterId?: number;
    targetId?: number;
  }): Promise<Report[]> {
    const where: any = {};
    if (filter?.reporterId) where.reporter = { id: filter.reporterId };
    if (filter?.targetId) where.targetUser = { id: filter.targetId };
    return this.reportsRepository.findAll({
      where,
      relations: ['reporter', 'targetUser', 'resolver'],
    });
  }

  async resolveReport(id: number, resolverId: number | null): Promise<Report> {
    const existing = await this.reportsRepository.findOneById(id, {
      relations: ['reporter', 'targetUser', 'resolver'],
    });
    if (!existing) throw new NotFoundException('Report not found');
    existing.isResolved = true;
    existing.resolvedAt = new Date();
    existing.resolver = resolverId ? ({ id: resolverId } as any) : null;
    return this.reportsRepository.save(existing);
  }
}
