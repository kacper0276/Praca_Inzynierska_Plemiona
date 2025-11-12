import { Global, Module } from '@nestjs/common';
import { WsGateway } from './gateways/ws.gateway';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  imports: [UsersModule],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class CoreModule {}
