import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { FriendRequestsRepository } from './repositories/friend-requests.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest])],
  providers: [FriendRequestsRepository],
  exports: [FriendRequestsRepository],
})
export class FriendRequestsModule {}
