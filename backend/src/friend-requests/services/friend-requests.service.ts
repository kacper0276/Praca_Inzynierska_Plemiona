import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendRequest } from '../entities/friend-request.entity';
import { FriendRequestsRepository } from '../repositories/friend-requests.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { DataSource } from 'typeorm';
import { FriendRequestStatus } from 'src/core/enums/friend-request-status.enum';
import { RespondToFriendRequestDto } from '../dto/respond-to-friend-request.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FriendRequestsService {
  constructor(
    private readonly friendRequestsRepository: FriendRequestsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getSentFriendRequests(userId: number): Promise<FriendRequest[]> {
    return this.friendRequestsRepository.find({
      where: { sender: { id: userId } },
      relations: ['receiver'],
    });
  }

  async getReceivedFriendRequests(userId: number): Promise<FriendRequest[]> {
    return this.friendRequestsRepository.find({
      where: { receiver: { id: userId } },
      relations: ['sender'],
    });
  }

  async getAllFriendRequests(userId: number): Promise<FriendRequest[]> {
    return this.friendRequestsRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ['sender', 'receiver'],
    });
  }

  async respondToFriendRequest(
    requestId: number,
    userId: number,
    dto: RespondToFriendRequestDto,
  ): Promise<FriendRequest> {
    const { status } = dto;

    if (status === FriendRequestStatus.PENDING) {
      throw new BadRequestException('Cannot set status back to pending.');
    }

    const request = await this.friendRequestsRepository.findOne(
      { id: requestId },
      { relations: ['sender', 'receiver'] },
    );

    if (!request) {
      throw new NotFoundException('Friend request not found.');
    }

    if (request.receiver.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to respond to this friend request.',
      );
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException(
        'This friend request has already been processed.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      request.status = status;
      const savedRequest = await manager.save(request);

      if (status === FriendRequestStatus.ACCEPTED) {
        const senderId = request.sender.id;
        const receiverId = request.receiver.id;

        const sender = await manager.findOne(User, {
          where: { id: senderId },
          relations: ['friends'],
        });
        const receiver = await manager.findOne(User, {
          where: { id: receiverId },
          relations: ['friends'],
        });

        if (!sender.friends.some((f) => f.id === receiver.id)) {
          sender.friends.push(receiver);
        }
        if (!receiver.friends.some((f) => f.id === sender.id)) {
          receiver.friends.push(sender);
        }

        await manager.save(sender);
        await manager.save(receiver);
      }

      return savedRequest;
    });
  }
}
