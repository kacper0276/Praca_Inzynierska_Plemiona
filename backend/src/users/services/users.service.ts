import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`Użytkownik nie został znaleziony.`);
    }
    return user;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException(`Użytkownik nie został znaleziony.`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneByEmailOrLogin(
      createUserDto.email,
      createUserDto.login,
    );

    if (existingUser) {
      throw new ConflictException(
        'Użytkownik z tym e-mailem lub loginem już istnieje.',
      );
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: passwordHash,
    });

    return this.usersRepository.save(newUser);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async setUserOnlineStatus(email: string, isOnline: boolean): Promise<void> {
    const user = await this.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException(`Użytkownik nie został znaleziony.`);
    }

    user.isOnline = isOnline;

    await this.usersRepository.save(user);
  }
}
