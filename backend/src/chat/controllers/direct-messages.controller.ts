import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { DirectMessagesService } from '../services/direct-messages.service';
import { CreateDirectMessageDto } from '../dto/create-direct-message.dto';
import { Authenticated } from '../../core/decorators/authenticated.decorator';
import { CurrentUser } from '@core/decorators/current-user.decorator';

@ApiTags('Direct Messages')
@ApiBearerAuth('access-token')
@Controller('direct-messages')
export class DirectMessagesController {
  constructor(private readonly dmService: DirectMessagesService) {}

  @Post()
  @Authenticated()
  @ApiCreatedResponse({ description: 'Wiadomość została wysłana.' })
  async send(
    @Body() createDmDto: CreateDirectMessageDto,
    @CurrentUser() user: any,
  ) {
    const senderId = user.sub;
    return this.dmService.send(senderId, createDmDto);
  }

  @Get('conversation/:friendId')
  @Authenticated()
  @ApiOkResponse({ description: 'Historia rozmowy z użytkownikiem.' })
  async getConversation(
    @Param('friendId', ParseIntPipe) friendId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user.sub;
    return this.dmService.getConversation(userId, friendId);
  }
}
