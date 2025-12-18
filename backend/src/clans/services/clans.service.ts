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

  async create(createClanDto: CreateClanDto): Promise<Clan> {
    const { memberIds, founderId, serverId, ...clanData } = createClanDto;

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const clanRepo = transactionalEntityManager.getRepository(Clan);
        const userRepo = transactionalEntityManager.getRepository(User);

        const founder = await userRepo.findOne({
          where: { id: founderId },
          relations: ['clan'],
        });

        if (!founder) {
          throw new NotFoundException('Użytkownik nie istnieje.');
        }

        if (founder.clan) {
          throw new BadRequestException(
            'Jesteś już członkiem lub założycielem innego klanu.',
          );
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
            relations: ['clan'],
          });

          if (invitedUsers.length !== memberIds.length) {
            throw new NotFoundException(
              'Nie znaleziono wszystkich zaproszonych użytkowników.',
            );
          }

          const alreadyInClan = invitedUsers.filter((u) => u.clan !== null);
          if (alreadyInClan.length > 0) {
            const names = alreadyInClan.map((u) => u.login).join(', ');
            throw new BadRequestException(
              `Następujący użytkownicy są już w innych klanach: ${names}`,
            );
          }

          members = [...members, ...invitedUsers];
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
