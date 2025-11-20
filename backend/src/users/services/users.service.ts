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
import * as fs from 'fs/promises';
import { join } from 'path';
import { UpdateUserDeletionTimeDto } from '../dto/update-user-deletion-time.dto';

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

  async update(
    email: string,
    updateUserDto: UpdateUserDto,
    files?: {
      profileImage?: Express.Multer.File[];
      backgroundImage?: Express.Multer.File[];
    },
  ): Promise<User> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Użytkownik o email ${email} nie został znaleziony.`,
      );
    }

    const publicUploadsPath = join(process.cwd(), 'public');

    if (files?.profileImage?.[0]) {
      const relativePath = `/uploads/${files.profileImage[0].filename}`;

      if (user.profileImage) {
        const oldFilePath = join(publicUploadsPath, user.profileImage);
        try {
          await fs.unlink(oldFilePath);
        } catch (e) {
          console.error(
            'Błąd usuwania starego awatara (plik mógł nie istnieć):',
            e.message,
          );
        }
      }
      user.profileImage = relativePath;
    }

    if (files?.backgroundImage?.[0]) {
      const relativePath = `/uploads/${files.backgroundImage[0].filename}`;

      if (user.backgroundImage) {
        const oldFilePath = join(publicUploadsPath, user.backgroundImage);
        try {
          await fs.unlink(oldFilePath);
        } catch (e) {
          console.error(
            'Błąd usuwania starego tła (plik mógł nie istnieć):',
            e.message,
          );
        }
      }
      user.backgroundImage = relativePath;
    }

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

  async setDeletionTime(
    userId: number,
    dto: UpdateUserDeletionTimeDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Użytkownik nie został znaleziony.');
    }

    user.deleteAt = dto.deleteAt;

    return this.usersRepository.save(user);
  }
}
