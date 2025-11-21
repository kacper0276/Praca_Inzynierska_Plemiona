import { Injectable } from '@nestjs/common';
import { FriendRequest } from '../entities/friend-request.entity';
import { FriendRequestsRepository } from '../repositories/friend-requests.repository';

@Injectable()
export class FriendRequestsService {
  constructor(
    private readonly friendRequestsRepository: FriendRequestsRepository,
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
}
