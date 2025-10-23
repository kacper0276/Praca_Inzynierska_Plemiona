import { Injectable, NotFoundException } from '@nestjs/common';
import { Clan } from '../entities/clan.entity';
import { ClansRepository } from '../repositories/clans.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UpdateClanDto } from '../dto/update-clan.dto';
import { CreateClanDto } from '../dto/create-clan.dto';
import { User } from 'src/users/entities/user.entity';
import { In } from 'typeorm';

@Injectable()
export class ClansService {
  constructor(
    private readonly clansRepository: ClansRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  findAll(): Promise<Clan[]> {
    return this.clansRepository.findAll({ relations: ['members'] });
  }

  findOne(id: number): Promise<Clan | null> {
    return this.clansRepository.findOne({ id }, { relations: ['members'] });
  }

  async create(createClanDto: CreateClanDto): Promise<Clan> {
    const { memberIds, ...clanData } = createClanDto;

    let members: User[] = [];
    if (memberIds && memberIds.length > 0) {
      members = await this.usersRepository.findAll({
        where: { id: In(memberIds) },
      });
      if (members.length !== memberIds.length) {
        throw new NotFoundException(
          'Jeden lub więcej użytkowników o podanych ID nie istnieje.',
        );
      }
    }

    const newClan = this.clansRepository.create({
      ...clanData,
      members,
    });

    return this.clansRepository.save(newClan);
  }

  async update(id: number, updateClanDto: UpdateClanDto): Promise<Clan> {
    const clan = await this.findOne(id);

    const updatedClan = { ...clan, ...updateClanDto };
    return this.clansRepository.save(updatedClan);
  }

  async remove(id: number): Promise<void> {
    await this.clansRepository.delete(id);
  }
}
