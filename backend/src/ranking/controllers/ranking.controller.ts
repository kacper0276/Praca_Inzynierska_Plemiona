import { Controller, Get, Param, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
  @ApiOkResponse({ description: 'Zwraca ranking dla serwera.' })
  @ApiNotFoundResponse({
    description: 'Nie znaleziono serwera.',
  })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do pobierania rankingu serwera.',
  })
  async getRankingForServer(
    @Param('serverName') serverName: string,
    @Request() req: any,
  ) {
    return this.rankingService.getRankingForServer(serverName, req.user.sub);
  }
}
