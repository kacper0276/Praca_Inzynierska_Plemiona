import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { ListReportsQueryDto } from '../dto/list-reports.query.dto';
import { ReportsRepository } from '../repositories/reports.repository';
import { Report } from '../entities/report.entity';
import { UsersRepository } from 'src/users/repositories/users.repository';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createReport(
    reporterId: number,
    createReportDto: CreateReportDto,
  ): Promise<Report> {
    const { targetUser, content, title } = createReportDto;

    let targetUserEntity: User | null = null;

    if (targetUser) {
      targetUserEntity = await this.usersRepository.findOne({
        email: targetUser,
      });

      if (!targetUserEntity) {
        throw new NotFoundException(
          `Użytkownik z adresem email '${targetUser}' nie został znaleziony.`,
        );
      }
    }

    const entity = this.reportsRepository.create({
      title,
      content,
      reporter: { id: reporterId } as User,
      targetUser: targetUserEntity,
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

  async resolveReport(
    id: number,
    resolverId: number,
    resolveStatus: boolean,
  ): Promise<Report> {
    const existing = await this.reportsRepository.findOneById(id);

    if (!existing) {
      throw new NotFoundException(
        `Zgłoszenie o ID ${id} nie zostało znalezione.`,
      );
    }

    console.log(resolveStatus);
    console.log(id);

    existing.isResolved = resolveStatus;
    existing.resolvedAt = new Date();
    existing.resolver = { id: resolverId } as User;

    return this.reportsRepository.save(existing);
  }

  async deleteReport(reportId: number) {
    return this.reportsRepository.delete(reportId);
  }
}
