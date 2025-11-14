import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { JobsService } from './services/jobs.service';
import { ServersModule } from 'src/servers/servers.module';
import { ResourcesModule } from 'src/resources/resources.module';
import { BuildingsModule } from 'src/buildings/buildings.module';

@Module({
  imports: [
    UsersModule,
    ServersModule,
    ResourcesModule,
    forwardRef(() => BuildingsModule),
  ],
  providers: [JobsService],
})
export class JobsModule {}
