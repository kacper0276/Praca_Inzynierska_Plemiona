import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Put,
  Request,
  HttpStatus,
  HttpCode,
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
import { UserRole } from 'src/core/enums/user-role.enum';
import { Roles } from 'src/core/decorators/roles.decorator';
import { ListReportsQueryDto } from '../dto/list-reports.query.dto';
import { Authenticated } from 'src/core/decorators/authenticated.decorator';

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
    @Request() req: any,
  ): Promise<Report> {
    const reporterId = req.user.sub;
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

  @Put(':id/resolve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Zgłoszenie zostało pomyślnie rozwiązane.' })
  @ApiNotFoundResponse({
    description: 'Zgłoszenie o podanym ID nie zostało znalezione.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji.' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do rozwiązywania zgłoszeń.',
  })
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<Report> {
    const resolverId = req.user.sub;
    return this.reportsService.resolveReport(id, resolverId);
  }
}
