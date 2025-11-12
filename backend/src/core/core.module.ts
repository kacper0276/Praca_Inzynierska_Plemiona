import { Global, Module } from '@nestjs/common';
import { WsGateway } from './gateways/ws.gateway';

@Global()
@Module({
  providers: [WsGateway],
  exports: [WsGateway],
})
export class CoreModule {}
