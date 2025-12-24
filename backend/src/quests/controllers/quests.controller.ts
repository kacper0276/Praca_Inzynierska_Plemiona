import { Authenticated } from '@core/decorators/authenticated.decorator';
import { Roles } from '@core/decorators/roles.decorator';
import { UserRole } from '@core/enums/user-role.enum';
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { QuestsService } from '../services/quests.service';
import { CreateQuestDto } from '../dto/create-quest.dto';

@ApiTags('Quests')
@ApiBearerAuth('access-token')
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ description: 'Quest został utworzony.' })
  async createQuest(@Body() questData: CreateQuestDto) {
    return this.questsService.createQuest(questData);
  }

  @Get('server/:serverId')
  @Authenticated()
  @ApiOkResponse({
    description: 'Zwraca listę zadań użytkownika na danym serwerze.',
  })
  async getMyQuests(
    @Param('serverId', ParseIntPipe) serverId: number,
    @Request() req: any,
  ) {
    return this.questsService.getUserQuests(req.user.sub, serverId);
  }

  @Post(':questId/start/:serverId')
  @Authenticated()
  @ApiOkResponse({ description: 'Rozpoczyna zadanie na konkretnym serwerze.' })
  async startQuest(
    @Param('questId', ParseIntPipe) questId: number,
    @Param('serverId', ParseIntPipe) serverId: number,
    @Request() req: any,
  ) {
    return this.questsService.startQuest(req.user.sub, serverId, questId);
  }

  @Patch('objective/:objectiveId/progress')
  @Authenticated()
  @ApiOkResponse({ description: 'Aktualizuje postęp podpunktu.' })
  async updateProgress(
    @Param('objectiveId', ParseIntPipe) objectiveId: number,
    @Query('serverId', ParseIntPipe) serverId: number,
    @Query('amount', ParseIntPipe) amount: number,
    @Request() req: any,
  ) {
    return this.questsService.updateObjectiveProgress(
      req.user.sub,
      serverId,
      objectiveId,
      amount,
    );
  }
}
