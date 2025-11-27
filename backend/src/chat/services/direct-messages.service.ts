import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DirectMessagesRepository } from '../repositories/direct-messages.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { DirectMessage } from '../entities/direct-message.entity';
import { WsGateway } from '../../core/gateways/ws.gateway';
import { WsEvent } from '../../core/enums/ws-event.enum';
import { CreateDirectMessageDto } from '../dto/create-direct-message.dto';

@Injectable()
export class DirectMessagesService {
  constructor(
    private readonly dmRepository: DirectMessagesRepository,
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => WsGateway))
    private readonly wsGateway: WsGateway,
  ) {}

  async getConversation(
    userId: number,
    friendId: number,
  ): Promise<DirectMessage[]> {
    const friend = await this.usersRepository.findOneById(friendId);
    if (!friend) {
      throw new NotFoundException('Użytkownik nie istnieje.');
    }

    return this.dmRepository.findConversation(userId, friendId);
  }

  async send(
    senderId: number,
    dto: CreateDirectMessageDto,
  ): Promise<DirectMessage> {
    const sender = await this.usersRepository.findOneById(senderId);
    const receiver = await this.usersRepository.findOneById(dto.receiverId);

    if (!receiver) {
      throw new NotFoundException('Odbiorca nie został znaleziony.');
    }

    const message = this.dmRepository.create({
      content: dto.content,
      sender,
      receiver,
      isRead: false,
    });

    const savedMessage = await this.dmRepository.save(message);

    this.wsGateway.sendToUser(receiver.id, WsEvent.DIRECT_MESSAGE_SEND, {
      message: savedMessage,
      senderId: sender.id,
    });

    return savedMessage;
  }
}
