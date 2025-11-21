import { Controller, Get, Request } from '@nestjs/common';
import { FriendRequestsService } from '../services/friend-requests.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Authenticated } from 'src/core/decorators/authenticated.decorator';

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
}
