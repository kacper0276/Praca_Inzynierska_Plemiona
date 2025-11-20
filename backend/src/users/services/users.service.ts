import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs/promises';
import { join } from 'path';
import { UpdateUserDeletionTimeDto } from '../dto/update-user-deletion-time.dto';
import { FriendRequestsRepository } from 'src/friend-requests/repositories/friend-requests.repository';
import { FriendRequestStatus } from 'src/core/enums/friend-request-status.enum';
import { FriendRequest } from 'src/friend-requests/entities/friend-request.entity';
import { ILike, In, Not } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly friendRequestsRepository: FriendRequestsRepository,
  ) {}

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

  async sendFriendRequestByEmail(
    senderId: number,
    receiverEmail: string,
  ): Promise<FriendRequest> {
    const receiver = await this.usersRepository.findOneByEmail(receiverEmail);
    if (!receiver) {
      throw new NotFoundException(
        `User with email ${receiverEmail} not found.`,
      );
    }
    return this.sendFriendRequest(senderId, receiver.id);
  }

  async searchUsers(query: string, currentUserId: number): Promise<User[]> {
    if (!query) {
      return [];
    }
    const currentUser = await this.usersRepository.findOneById(currentUserId, {
      relations: ['friends'],
    });
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }
    const friendIds = currentUser.friends.map((friend) => friend.id);
    const idsToExclude = [currentUserId, ...friendIds];

    return this.usersRepository.find({
      where: {
        login: ILike(`%${query}%`),
        id: Not(In(idsToExclude)),
      },
      select: ['id', 'login', 'profileImage', 'email'],
      take: 10,
    });
  }

  async sendFriendRequest(
    senderId: number,
    receiverId: number,
  ): Promise<FriendRequest> {
    if (senderId === receiverId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself.',
      );
    }

    const sender = await this.findOne(senderId);
    const receiver = await this.findOne(receiverId);

    const existingRequests = await this.friendRequestsRepository.find({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ],
    });

    if (existingRequests.length > 0) {
      throw new ConflictException(
        'A friend request already exists between these users.',
      );
    }

    const newRequest = this.friendRequestsRepository.create({
      sender,
      receiver,
      status: FriendRequestStatus.PENDING,
    });

    return this.friendRequestsRepository.save(newRequest);
  }
}
