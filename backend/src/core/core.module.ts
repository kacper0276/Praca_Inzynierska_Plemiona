import { forwardRef, Global, Module } from '@nestjs/common';
import { WsGateway } from './gateways/ws.gateway';
import { UsersModule } from 'src/users/users.module';
import { VillagesModule } from 'src/villages/villages.module';
import { BuildingsModule } from 'src/buildings/buildings.module';
import { FriendRequestsModule } from 'src/friend-requests/friend-requests.module';
import { ChatModule } from 'src/chat/chat.module';
import { QuestsModule } from 'src/quests/quests.module';

@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => VillagesModule),
    forwardRef(() => BuildingsModule),
    forwardRef(() => FriendRequestsModule),
    forwardRef(() => ChatModule),
    forwardRef(() => QuestsModule),
  ],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class CoreModule {}
