import { forwardRef, Global, Module } from '@nestjs/common';
import { WsGateway } from './gateways/ws.gateway';
import { UsersModule } from 'src/users/users.module';
import { VillagesModule } from 'src/villages/villages.module';

@Global()
@Module({
  imports: [UsersModule, forwardRef(() => VillagesModule)],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class CoreModule {}
