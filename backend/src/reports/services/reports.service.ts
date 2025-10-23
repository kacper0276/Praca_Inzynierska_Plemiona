import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { ListReportsQueryDto } from '../dto/list-reports.query.dto';
import { ReportsRepository } from '../repositories/reports.repository';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async createReport(
    reporterId: number,
    createReportDto: CreateReportDto,
  ): Promise<Report> {
    const { targetUserId, content } = createReportDto;

    const entity = this.reportsRepository.create({
      content,
      reporter: { id: reporterId } as User,
      targetUser: { id: targetUserId } as User,
    });

    return this.reportsRepository.save(entity);
  }

  async listReports(filter: ListReportsQueryDto): Promise<Report[]> {
    const { reporterId, targetId } = filter;
    const where: any = {};

    if (reporterId) where.reporter = { id: reporterId };
    if (targetId) where.targetUser = { id: targetId };

    return this.reportsRepository.findAll({
      where,
      relations: ['reporter', 'targetUser', 'resolver'],
    });
  }

  async resolveReport(id: number, resolverId: number): Promise<Report> {
    const existing = await this.reportsRepository.findOneById(id);

    if (!existing) {
      throw new NotFoundException(
        `Zgłoszenie o ID ${id} nie zostało znalezione.`,
      );
    }

    existing.isResolved = true;
    existing.resolvedAt = new Date();
    existing.resolver = { id: resolverId } as User;

    return this.reportsRepository.save(existing);
  }
}
