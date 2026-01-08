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
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { QuestsService } from '../services/quests.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { CurrentUser } from '@core/decorators/current-user.decorator';

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

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Zwraca listę wszystkich zadań',
  })
  async getAllQuests() {
    return this.questsService.getAll();
  }

  @Get('server/:serverId')
  @Authenticated()
  @ApiOkResponse({
    description: 'Zwraca listę zadań użytkownika na danym serwerze.',
  })
  async getMyQuests(
    @Param('serverId', ParseIntPipe) serverId: number,
    @CurrentUser() user: any,
  ) {
    return this.questsService.getUserQuests(user.sub, serverId);
  }

  @Post(':questId/start/:serverId')
  @Authenticated()
  @ApiOkResponse({ description: 'Rozpoczyna zadanie na konkretnym serwerze.' })
  async startQuest(
    @Param('questId', ParseIntPipe) questId: number,
    @Param('serverId', ParseIntPipe) serverId: number,
    @CurrentUser() user: any,
  ) {
    return this.questsService.startQuest(user.sub, serverId, questId);
  }

  @Patch('objective/:objectiveId/progress')
  @Authenticated()
  @ApiOkResponse({ description: 'Aktualizuje postęp podpunktu.' })
  async updateProgress(
    @Param('objectiveId', ParseIntPipe) objectiveId: number,
    @Query('serverId', ParseIntPipe) serverId: number,
    @Query('amount', ParseIntPipe) amount: number,
    @CurrentUser() user: any,
  ) {
    return this.questsService.updateObjectiveProgress(
      user.sub,
      serverId,
      objectiveId,
      amount,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Budynek został pomyślnie usunięty.' })
  @ApiNotFoundResponse({
    description: 'Budynek o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji' })
  async deleteQuest(@Param('id', ParseIntPipe) id: number) {
    return this.questsService.deleteQuest(id);
  }
}
