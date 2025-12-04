import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
} from '@nestjs/common';
import { FriendRequestsService } from '../services/friend-requests.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Authenticated } from '@core/decorators/authenticated.decorator';
import { RespondToFriendRequestDto } from '../dto/respond-to-friend-request.dto';

@ApiTags('Friend Requests')
@ApiBearerAuth('access-token')
@Controller('friend-requests')
export class FriendRequestsController {
  constructor(private readonly friendRequestsService: FriendRequestsService) {}

  @Get('sent')
  @Authenticated()
  @ApiOkResponse({ description: 'Lista wysłanych zaproszeń do znajomych.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async getSentFriendRequests(@Request() req: any) {
    const userId = req.user.sub;
    return this.friendRequestsService.getSentFriendRequests(userId);
  }

  @Get('received')
  @Authenticated()
  @ApiOkResponse({ description: 'Lista otrzymanych zaproszeń do znajomych.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async getReceivedFriendRequests(@Request() req: any) {
    const userId = req.user.sub;
    return this.friendRequestsService.getReceivedFriendRequests(userId);
  }

  @Get('all')
  @Authenticated()
  @ApiOkResponse({
    description:
      'Lista wszystkich zaproszeń do znajomych (wysłanych i otrzymanych).',
  })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async getAllFriendRequests(@Request() req: any) {
    const userId = req.user.sub;
    return this.friendRequestsService.getAllFriendRequests(userId);
  }

  @Patch(':id/respond')
  @Authenticated()
  @ApiBody({ type: RespondToFriendRequestDto })
  @ApiOkResponse({ description: 'Status zaproszenia został zaktualizowany.' })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowy status lub zaproszenie już obsłużone.',
  })
  @ApiForbiddenResponse({
    description: 'Próba odpowiedzi na cudze zaproszenie.',
  })
  @ApiNotFoundResponse({ description: 'Zaproszenie nie istnieje.' })
  async respondToFriendRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() respondDto: RespondToFriendRequestDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.friendRequestsService.respondToFriendRequest(
      id,
      userId,
      respondDto,
    );
  }
}
