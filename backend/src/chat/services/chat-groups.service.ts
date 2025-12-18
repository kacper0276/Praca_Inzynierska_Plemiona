import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ChatGroupsRepository } from '../repositories/chat-groups.repository';
import { GroupMessagesRepository } from '../repositories/group-messages.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CreateChatGroupDto } from '../dto/create-chat-group.dto';
import { ChatGroup } from '../entities/chat-group.entity';
import { GroupMessage } from '../entities/group-message.entity';
import { WsGateway } from '../../core/gateways/ws.gateway';
import { In } from 'typeorm';
import { CreateGroupMessageDto } from '../dto/create-group-message.dto';
import { WsEvent } from '@core/enums/ws-event.enum';

@Injectable()
export class ChatGroupsService {
  constructor(
    private readonly groupsRepository: ChatGroupsRepository,
    private readonly messagesRepository: GroupMessagesRepository,
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => WsGateway))
    private readonly wsGateway: WsGateway,
  ) {}

  async createGroup(dto: CreateChatGroupDto): Promise<ChatGroup> {
    let members = [];
    if (dto.memberIds && dto.memberIds.length > 0) {
      const foundMembers = await this.usersRepository.find({
        where: { id: In(dto.memberIds) },
      });
      members = [...members, ...foundMembers];
    }

    members = [...new Set(members)];

    const group = this.groupsRepository.create({
      name: dto.name,
      description: dto.description,
      members,
    });

    return this.groupsRepository.save(group);
  }

  async sendMessage(
    userId: number,
    groupId: number,
    dto: CreateGroupMessageDto,
  ): Promise<GroupMessage> {
    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      throw new NotFoundException('Grupa nie została znaleziona.');
    }

    const sender = await this.usersRepository.findOneById(userId);
    const isMember = group.members.some((member) => member.id === userId);

    if (!isMember) {
      throw new ForbiddenException(
        'Nie możesz pisać w grupie, do której nie należysz.',
      );
    }

    const message = this.messagesRepository.create({
      content: dto.content,
      group,
      sender,
    });

    const savedMessage = await this.messagesRepository.save(message);

    this.wsGateway.sendGroupMessageToRoom(groupId, savedMessage);

    return savedMessage;
  }

  async getUserGroups(userId: number): Promise<ChatGroup[]> {
    return this.groupsRepository.findUserGroups(userId);
  }

  async getGroupMessages(
    userId: number,
    groupId: number,
  ): Promise<GroupMessage[]> {
    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      throw new NotFoundException('Grupa nie została znaleziona.');
    }

    const isMember = group.members.some((member) => member.id === userId);
    if (!isMember) {
      throw new ForbiddenException('Nie jesteś członkiem tej grupy.');
    }

    return this.messagesRepository.findByGroupId(groupId);
  }
}
