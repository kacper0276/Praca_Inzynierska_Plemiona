import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Authenticated } from '../../core/decorators/authenticated.decorator';
import { ChatService } from '../services/chat.service';
import { ChatOverviewDto } from '../models/chat-overview-item.model';

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('overview')
  @Authenticated()
  @ApiOkResponse({ type: [ChatOverviewDto] })
  async getOverview(@Request() req: any) {
    return this.chatService.getOverview(req.user.sub);
  }
}
