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
} from '@nestjs/swagger';
import { DirectMessagesService } from '../services/direct-messages.service';
import { CreateDirectMessageDto } from '../dto/create-direct-message.dto';
import { Authenticated } from '../../core/decorators/authenticated.decorator';

@ApiTags('Direct Messages')
@ApiBearerAuth('access-token')
@Controller('direct-messages')
export class DirectMessagesController {
  constructor(private readonly dmService: DirectMessagesService) {}

  @Post()
  @Authenticated()
  @ApiCreatedResponse({ description: 'Wiadomość została wysłana.' })
  async send(@Body() createDmDto: CreateDirectMessageDto, @Request() req: any) {
    const senderId = req.user.sub;
    return this.dmService.send(senderId, createDmDto);
  }

  @Get('conversation/:friendId')
  @Authenticated()
  @ApiOkResponse({ description: 'Historia rozmowy z użytkownikiem.' })
  async getConversation(
    @Param('friendId', ParseIntPipe) friendId: number,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.dmService.getConversation(userId, friendId);
  }
}
