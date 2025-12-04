import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RankingService } from '../services/ranking.service';
import { Authenticated } from '@core/decorators/authenticated.decorator';

@ApiTags('Ranking')
@ApiBearerAuth('access-token')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('for-server/:serverName')
  @Authenticated()
  @ApiOkResponse({ description: 'Zwraca paginowany ranking dla serwera.' })
  @ApiNotFoundResponse({ description: 'Nie znaleziono serwera.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRankingForServer(
    @Param('serverName') serverName: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req: any,
  ) {
    return this.rankingService.getRankingForServer(
      serverName,
      req.user.sub,
      page,
      limit,
    );
  }
}
