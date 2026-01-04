import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ChatGroupsService } from '../services/chat-groups.service';
import { CreateChatGroupDto } from '../dto/create-chat-group.dto';
import { Authenticated } from '../../core/decorators/authenticated.decorator';
import { CreateGroupMessageDto } from '../dto/create-group-message.dto';
import { CurrentUser } from '@core/decorators/current-user.decorator';

@ApiTags('Chat Groups')
@ApiBearerAuth('access-token')
@Controller('chat-groups')
export class ChatGroupsController {
  constructor(private readonly chatGroupsService: ChatGroupsService) {}

  @Post()
  @Authenticated()
  @ApiCreatedResponse({ description: 'Grupa czatu została utworzona.' })
  @ApiNotFoundResponse({
    description: 'Jeden z dodawanych użytkowników nie został znaleziony.',
  })
  async create(@Body() createGroupDto: CreateChatGroupDto) {
    return this.chatGroupsService.createGroup(createGroupDto);
  }

  @Post(':id/messages')
  @Authenticated()
  @ApiCreatedResponse({ description: 'Wiadomość została wysłana na grupę.' })
  @ApiNotFoundResponse({ description: 'Grupa o podanym ID nie istnieje.' })
  @ApiForbiddenResponse({
    description: 'Nie jesteś członkiem tej grupy (brak dostępu).',
  })
  async sendMessage(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() dto: CreateGroupMessageDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.chatGroupsService.sendMessage(userId, groupId, dto);
  }

  @Get('by-chat-name/:name')
  @Authenticated()
  @ApiOkResponse({
    description: 'Pobrano listę grup, do których należy użytkownik.',
  })
  @ApiNotFoundResponse({ description: 'Grupa o podanej nazwie nie istnieje.' })
  @ApiForbiddenResponse({
    description: 'Nie jesteś członkiem tej grupy (brak dostępu).',
  })
  async getChatByName(@Param('name') name: string, @CurrentUser() user: any) {
    return this.chatGroupsService.getChatByName(name, user.sub);
  }

  @Get()
  @Authenticated()
  @ApiOkResponse({
    description: 'Pobrano listę grup, do których należy użytkownik.',
  })
  async getUserGroups(@Request() req: any) {
    const userId = req.user.sub;
    return this.chatGroupsService.getUserGroups(userId);
  }

  @Get(':id/messages')
  @Authenticated()
  @ApiOkResponse({ description: 'Pobrano historię wiadomości w grupie.' })
  @ApiNotFoundResponse({ description: 'Grupa o podanym ID nie istnieje.' })
  @ApiForbiddenResponse({
    description: 'Nie jesteś członkiem tej grupy (brak dostępu).',
  })
  async getGroupMessages(
    @Param('id', ParseIntPipe) groupId: number,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.chatGroupsService.getGroupMessages(userId, groupId);
  }
}
