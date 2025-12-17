import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/repositories/base.repository';
import { DirectMessage } from '../entities/direct-message.entity';

@Injectable()
export class DirectMessagesRepository extends BaseRepository<DirectMessage> {
  constructor(
    @InjectRepository(DirectMessage)
    private readonly repository: Repository<DirectMessage>,
  ) {
    super();
  }

  create(data: Partial<DirectMessage>): DirectMessage {
    return this.repository.create(data);
  }

  save(data: DirectMessage): Promise<DirectMessage> {
    return this.repository.save(data);
  }

  findAll(options?: any): Promise<DirectMessage[]> {
    return this.repository.find(options);
  }

  find(options?: any): Promise<DirectMessage[]> {
    return this.repository.find(options);
  }

  findOne(
    where: Partial<DirectMessage>,
    options?: any,
  ): Promise<DirectMessage> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<DirectMessage> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  update(id: number, data: Partial<DirectMessage>): Promise<DirectMessage> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findConversation(
    userId1: number,
    userId2: number,
  ): Promise<DirectMessage[]> {
    return this.repository.find({
      where: [
        { sender: { id: userId1 }, receiver: { id: userId2 } },
        { sender: { id: userId2 }, receiver: { id: userId1 } },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  async findUnreadCount(userId: number): Promise<number> {
    return this.repository.count({
      where: { receiver: { id: userId }, isRead: false },
    });
  }

  async findUserAllMessages(userId: number): Promise<DirectMessage[]> {
    return this.repository
      .createQueryBuilder('dm')
      .leftJoinAndSelect('dm.sender', 'sender')
      .leftJoinAndSelect('dm.receiver', 'receiver')
      .where('dm.sender_id = :userId OR dm.receiver_id = :userId', { userId })
      .orderBy('dm.createdAt', 'DESC')
      .getMany();
  }
}
