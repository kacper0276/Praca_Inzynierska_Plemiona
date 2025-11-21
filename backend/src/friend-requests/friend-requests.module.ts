import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { FriendRequestsRepository } from './repositories/friend-requests.repository';
import { FriendRequestsService } from './services/friend-requests.service';
import { FriendRequestsController } from './controllers/friend-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest])],
  controllers: [FriendRequestsController],
  providers: [FriendRequestsRepository, FriendRequestsService],
  exports: [FriendRequestsRepository],
})
export class FriendRequestsModule {}
