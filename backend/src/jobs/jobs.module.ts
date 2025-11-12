import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { JobsService } from './services/jobs.service';
import { ServersModule } from 'src/servers/servers.module';

@Module({
  imports: [UsersModule, ServersModule],
  providers: [JobsService],
})
export class JobsModule {}
