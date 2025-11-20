import { BaseRepository } from 'src/core/repositories/base.repository';
import { FriendRequest } from '../entities/friend-request.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class FriendRequestsRepository extends BaseRepository<FriendRequest> {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly repository: Repository<FriendRequest>,
  ) {
    super();
  }

  findAll(options?: any): Promise<FriendRequest[]> {
    return this.repository.find(options);
  }

  find(options?: any): Promise<FriendRequest[]> {
    return this.repository.find(options);
  }

  findOne(
    where: Partial<FriendRequest>,
    options?: any,
  ): Promise<FriendRequest | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<FriendRequest | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  create(data: Partial<FriendRequest>): FriendRequest {
    return this.repository.create(data);
  }

  save(data: Partial<FriendRequest>): Promise<FriendRequest> {
    return this.repository.save(data);
  }

  update(id: number, entity: Partial<FriendRequest>): Promise<FriendRequest> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
