import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/repositories/base.repository';
import { ChatGroup } from '../entities/chat-group.entity';

@Injectable()
export class ChatGroupsRepository extends BaseRepository<ChatGroup> {
  constructor(
    @InjectRepository(ChatGroup)
    private readonly repository: Repository<ChatGroup>,
  ) {
    super();
  }

  create(data: Partial<ChatGroup>): ChatGroup {
    return this.repository.create(data);
  }

  save(data: ChatGroup): Promise<ChatGroup> {
    return this.repository.save(data);
  }

  findAll(options?: any): Promise<ChatGroup[]> {
    return this.repository.find(options);
  }

  find(options?: any): Promise<ChatGroup[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<ChatGroup>, options?: any): Promise<ChatGroup> {
    return this.repository.findOne({ where, ...options });
  }
  update(id: number, data: Partial<ChatGroup>): Promise<ChatGroup> {
    return this.repository.save({ ...data, id });
  }

  findOneById(id: number): Promise<ChatGroup | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['members'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findUserGroups(userId: number): Promise<ChatGroup[]> {
    return this.repository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .where('member.id = :userId', { userId })
      .orderBy('group.createdAt', 'DESC')
      .getMany();
  }

  async findUserGroupsWithLastMessage(userId: number): Promise<ChatGroup[]> {
    return this.repository
      .createQueryBuilder('group')
      .innerJoin('group.members', 'member', 'member.id = :userId', { userId })
      .leftJoinAndSelect('group.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }
}
