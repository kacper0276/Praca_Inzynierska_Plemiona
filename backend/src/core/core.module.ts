import { forwardRef, Global, Module } from '@nestjs/common';
import { WsGateway } from './gateways/ws.gateway';
import { UsersModule } from 'src/users/users.module';
import { VillagesModule } from 'src/villages/villages.module';
import { BuildingsModule } from 'src/buildings/buildings.module';

@Global()
@Module({
  imports: [UsersModule, forwardRef(() => VillagesModule), BuildingsModule],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class CoreModule {}
