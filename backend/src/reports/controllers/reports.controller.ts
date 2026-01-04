import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Patch,
  Delete,
} from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { Report } from '../entities/report.entity';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateReportDto } from '../dto/create-report.dto';
import { UserRole } from '@core/enums/user-role.enum';
import { Roles } from '@core/decorators/roles.decorator';
import { ListReportsQueryDto } from '../dto/list-reports.query.dto';
import { Authenticated } from '@core/decorators/authenticated.decorator';
import { CurrentUser } from '@core/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Authenticated()
  @ApiCreatedResponse({
    description: 'Zgłoszenie zostało pomyślnie utworzone.',
  })
  @ApiBadRequestResponse({ description: 'Przesłane dane są nieprawidłowe.' })
  @ApiUnauthorizedResponse({
    description: 'Brak autoryzacji (użytkownik niezalogowany).',
  })
  create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: any,
  ): Promise<Report> {
    const reporterId = user.sub;
    return this.reportsService.createReport(reporterId, createReportDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Zwraca listę zgłoszeń.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji.' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do przeglądania zgłoszeń.',
  })
  list(@Query() query: ListReportsQueryDto): Promise<Report[]> {
    return this.reportsService.listReports(query);
  }

  @Patch(':id/change-status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Status zgłoszenia został zmieniony.' })
  @ApiNotFoundResponse({
    description: 'Zgłoszenie o podanym ID nie zostało znalezione.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji.' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do zmiany statusu zgłoszeń.',
  })
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() data: { resolvedStatus: boolean },
  ): Promise<Report> {
    const resolverId = user.sub;
    return this.reportsService.resolveReport(
      id,
      resolverId,
      data.resolvedStatus,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Zgłoszenie zostało pomyślnie usunięte.' })
  @ApiNotFoundResponse({
    description: 'Zgłoszenie o podanym ID nie zostało znalezione.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji.' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do usuwania zgłoszeń.',
  })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reportsService.deleteReport(id);
  }
}
