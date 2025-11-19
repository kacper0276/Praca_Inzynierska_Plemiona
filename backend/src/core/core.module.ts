import { forwardRef, Global, Module } from '@nestjs/common';
import { WsGateway } from './gateways/ws.gateway';
import { UsersModule } from 'src/users/users.module';
import { VillagesModule } from 'src/villages/villages.module';
import { BuildingsModule } from 'src/buildings/buildings.module';

@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => VillagesModule),
    forwardRef(() => BuildingsModule),
  ],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class CoreModule {}
