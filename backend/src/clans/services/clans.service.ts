import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Clan } from '../entities/clan.entity';
import { ClansRepository } from '../repositories/clans.repository';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { UpdateClanDto } from '../dto/update-clan.dto';
import { CreateClanDto } from '../dto/create-clan.dto';
import { User } from 'src/users/entities/user.entity';
import { DataSource, In } from 'typeorm';
import { ResourcesService } from 'src/resources/services/resources.service';
import { Server } from 'src/servers/entities/server.entity';
import { CLANS_COST } from '@core/consts/clans-cost';

@Injectable()
export class ClansService {
  constructor(
    private readonly clansRepository: ClansRepository,
    private readonly usersRepository: UsersRepository,
    private readonly resourcesService: ResourcesService,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Clan[]> {
    return this.clansRepository.findAll({ relations: ['members'] });
  }

  findOne(id: number): Promise<Clan | null> {
    return this.clansRepository.findOne({ id }, { relations: ['members'] });
  }

  async findUserClanForServer(
    userId: number,
    serverId: number,
  ): Promise<Clan | null> {
    return await this.clansRepository.findUserClanWithMembers(userId, serverId);
  }

  async kickUserFromClan(clanId: number, userId: number): Promise<void> {
    const clan = await this.clansRepository.findOne(
      {
        id: clanId,
      },
      { relations: ['members'] },
    );

    if (!clan) {
      throw new NotFoundException('Nie znaleziono klanu');
    }

    const memberIndex = clan.members.findIndex(
      (member) => member.id === userId,
    );

    if (memberIndex === -1) {
      throw new BadRequestException('Użytkownik nie należy do tego klanu');
    }

    clan.members.splice(memberIndex, 1);

    await this.clansRepository.save(clan);
  }

  async create(createClanDto: CreateClanDto): Promise<Clan> {
    const { memberIds, founderId, serverId, ...clanData } = createClanDto;

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const clanRepo = transactionalEntityManager.getRepository(Clan);
        const userRepo = transactionalEntityManager.getRepository(User);

        const founder = await userRepo.findOne({
          where: { id: founderId },
          relations: ['clans', 'clans.server'],
        });

        if (!founder) throw new NotFoundException('Użytkownik nie istnieje.');

        const isAlreadyInClanOnThisServer = founder.clans.some(
          (clan) => clan.server.id === serverId,
        );

        if (isAlreadyInClanOnThisServer) {
          throw new BadRequestException('Masz już klan na tym serwerze.');
        }

        await this.resourcesService.spendResources(
          founderId,
          serverId,
          CLANS_COST,
          transactionalEntityManager,
        );

        let members: User[] = [founder];

        if (memberIds && memberIds.length > 0) {
          const invitedUsers = await userRepo.find({
            where: { id: In(memberIds) },
            relations: ['clans', 'clans.server'],
          });

          for (const user of invitedUsers) {
            if (user.clans.some((c) => c.server.id === serverId)) {
              throw new BadRequestException(
                `Użytkownik ${user.login} należy już do innego klanu na tym serwerze.`,
              );
            }
          }
          members = [...new Set([...members, ...invitedUsers])];
        }

        const newClan = clanRepo.create({
          ...clanData,
          founder: founder,
          members: members,
          server: { id: serverId } as Server,
        });

        return await clanRepo.save(newClan);
      },
    );
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
