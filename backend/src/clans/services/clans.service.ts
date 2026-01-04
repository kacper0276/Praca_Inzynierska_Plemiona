import {
  BadRequestException,
  ForbiddenException,
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
import { ChatGroup } from 'src/chat/entities/chat-group.entity';

@Injectable()
export class ClansService {
  constructor(
    private readonly clansRepository: ClansRepository,
    private readonly usersRepository: UsersRepository,
    private readonly resourcesService: ResourcesService,
    private readonly dataSource: DataSource,
  ) {}

  private getClanChatName(serverId: number, clanName: string): string {
    return `${serverId}-${clanName}`;
  }

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

  async addMembersToClan(
    clanId: number,
    userIds: number[],
    currentUserId: number,
  ): Promise<void> {
    const clan = await this.clansRepository.findOne(
      { id: clanId },
      { relations: ['founder', 'members', 'server'] },
    );

    if (!clan) throw new NotFoundException('Nie znaleziono klanu.');

    if (clan.founder.id !== currentUserId) {
      throw new ForbiddenException(
        'Tylko założyciel klanu może dodawać nowych członków.',
      );
    }

    const usersToAdd = await this.usersRepository.find({
      where: { id: In(userIds) },
    });

    if (!usersToAdd.length) {
      throw new BadRequestException('Nie znaleziono wskazanych użytkowników.');
    }

    const currentMemberIds = new Set(clan.members.map((m) => m.id));
    const newUniqueMembers = usersToAdd.filter(
      (u) => !currentMemberIds.has(u.id),
    );

    if (newUniqueMembers.length === 0) return;

    clan.members.push(...newUniqueMembers);
    await this.clansRepository.save(clan);

    const chatName = this.getClanChatName(clan.server.id, clan.name);
    const chatGroupRepo = this.dataSource.getRepository(ChatGroup);

    const chatGroup = await chatGroupRepo.findOne({
      where: { name: chatName },
      relations: ['members'],
    });

    if (chatGroup) {
      const currentChatIds = new Set(chatGroup.members.map((m) => m.id));
      const membersToAddToChat = newUniqueMembers.filter(
        (u) => !currentChatIds.has(u.id),
      );
      if (membersToAddToChat.length > 0) {
        chatGroup.members.push(...membersToAddToChat);
        await chatGroupRepo.save(chatGroup);
      }
    }
  }

  async kickUserFromClan(clanId: number, userId: number): Promise<void> {
    const clan = await this.clansRepository.findOne(
      { id: clanId },
      { relations: ['members', 'server'] },
    );

    if (!clan) throw new NotFoundException('Nie znaleziono klanu');

    const memberIndex = clan.members.findIndex((m) => m.id === userId);
    if (memberIndex === -1) {
      throw new BadRequestException('Użytkownik nie należy do tego klanu');
    }

    clan.members.splice(memberIndex, 1);
    await this.clansRepository.save(clan);

    const chatName = this.getClanChatName(clan.server.id, clan.name);
    const chatGroupRepo = this.dataSource.getRepository(ChatGroup);

    const chatGroup = await chatGroupRepo.findOne({
      where: { name: chatName },
      relations: ['members'],
    });

    if (chatGroup) {
      const chatMemberIndex = chatGroup.members.findIndex(
        (m) => m.id === userId,
      );
      if (chatMemberIndex !== -1) {
        chatGroup.members.splice(chatMemberIndex, 1);
        await chatGroupRepo.save(chatGroup);
      }
    }
  }

  async create(createClanDto: CreateClanDto): Promise<Clan> {
    const { memberIds, founderId, serverId, ...clanData } = createClanDto;

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const clanRepo = transactionalEntityManager.getRepository(Clan);
        const userRepo = transactionalEntityManager.getRepository(User);
        const chatGroupRepo =
          transactionalEntityManager.getRepository(ChatGroup);

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

        const chatName = this.getClanChatName(serverId, clanData.name);

        let chatGroup = await chatGroupRepo.findOne({
          where: { name: chatName },
          relations: ['members'],
        });

        if (!chatGroup) {
          chatGroup = chatGroupRepo.create({
            name: chatName,
            description: `Czat klanu ${clanData.name}`,
            members: members,
          });
          await chatGroupRepo.save(chatGroup);
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
    const clan = await this.findOne(id);
    if (clan) {
      await this.clansRepository.delete(id);

      const chatName = this.getClanChatName(clan.server.id, clan.name);
      const chatGroupRepo = this.dataSource.getRepository(ChatGroup);
      const chatGroup = await chatGroupRepo.findOneBy({ name: chatName });

      if (chatGroup) {
        await chatGroupRepo.remove(chatGroup);
      }
    }
  }
}
