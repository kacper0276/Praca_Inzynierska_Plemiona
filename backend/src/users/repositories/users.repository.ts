import { BaseRepository } from 'src/core/repositories/base.repository';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {
    super();
  }

  findAll(): Promise<User[]> {
    return this.repository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  create(entity: User): Promise<User> {
    return this.repository.save(entity);
  }

  update(id: number, entity: Partial<User>): Promise<User> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }
}
