import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { JobsService } from './services/jobs.service';

@Module({
  imports: [UsersModule],
  providers: [JobsService],
})
export class JobsModule {}
