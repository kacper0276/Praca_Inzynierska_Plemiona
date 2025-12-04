import { BaseRepository } from '@core/repositories/base.repository';
import { User } from '../entities/user.entity';
import { IsNull, LessThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {
    super();
  }

  findAll(options?: any): Promise<User[]> {
    return this.repository.find(options);
  }

  find(options?: any): Promise<User[]> {
    return this.repository.find(options);
  }

  findOne(where: Partial<User>, options?: any): Promise<User | null> {
    return this.repository.findOne({ where, ...options });
  }

  findOneById(id: number, options?: any): Promise<User | null> {
    return this.repository.findOne({ where: { id }, ...options });
  }

  findOneByEmailOrLogin(email: string, login: string): Promise<User | null> {
    return this.repository.findOne({
      where: [{ email }, { login }],
    });
  }

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }

  save(data: Partial<User>): Promise<User> {
    return this.repository.save(data);
  }

  update(id: number, entity: Partial<User>): Promise<User> {
    return this.repository.save({ ...entity, id });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  async findInactiveUsersCreatedBefore(date: Date): Promise<User[]> {
    return this.repository.find({
      where: {
        isActive: false,
        createdAt: LessThan(date),
      },
    });
  }

  async findInactiveUsersMarkedToDeleteBefore(date: Date): Promise<User[]> {
    return this.repository.find({
      where: {
        isActive: false,
        deleteAt: LessThan(date),
      },
    });
  }

  async findInactiveUsersNotMarkedForDeletion(): Promise<User[]> {
    return this.repository.find({
      where: {
        isActive: false,
        deleteAt: IsNull(),
      },
    });
  }
}
