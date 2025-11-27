import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../core/repositories/base.repository';
import { GroupMessage } from '../entities/group-message.entity';

@Injectable()
export class GroupMessagesRepository extends BaseRepository<GroupMessage> {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly repository: Repository<GroupMessage>,
  ) {
    super();
  }

  create(data: Partial<GroupMessage>): GroupMessage {
    return this.repository.create(data);
  }

  save(data: GroupMessage): Promise<GroupMessage> {
    return this.repository.save(data);
  }

  findAll(options?: any): Promise<GroupMessage[]> {
    return this.repository.find(options);
  }

  find(options?: any): Promise<GroupMessage[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<GroupMessage>, options?: any): Promise<GroupMessage> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<GroupMessage> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  update(id: number, data: Partial<GroupMessage>): Promise<GroupMessage> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findByGroupId(
    groupId: number,
    limit: number = 50,
  ): Promise<GroupMessage[]> {
    return this.repository.find({
      where: { group: { id: groupId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }
}
