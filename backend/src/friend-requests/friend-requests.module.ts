import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { FriendRequestsRepository } from './repositories/friend-requests.repository';
import { FriendRequestsService } from './services/friend-requests.service';
import { FriendRequestsController } from './controllers/friend-requests.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest]),
    forwardRef(() => UsersModule),
  ],
  controllers: [FriendRequestsController],
  providers: [FriendRequestsRepository, FriendRequestsService],
  exports: [FriendRequestsRepository],
})
export class FriendRequestsModule {}
