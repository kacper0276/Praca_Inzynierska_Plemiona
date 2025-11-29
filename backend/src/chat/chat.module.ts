import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGroupsController } from './controllers/chat-groups.controller';
import { ChatGroup } from './entities/chat-group.entity';
import { DirectMessage } from './entities/direct-message.entity';
import { GroupMessage } from './entities/group-message.entity';
import { ChatGroupsRepository } from './repositories/chat-groups.repository';
import { DirectMessagesRepository } from './repositories/direct-messages.repository';
import { GroupMessagesRepository } from './repositories/group-messages.repository';
import { ChatGroupsService } from './services/chat-groups.service';
import { DirectMessagesService } from './services/direct-messages.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatGroup, DirectMessage, GroupMessage]),
    UsersModule,
  ],
  controllers: [ChatGroupsController],
  providers: [
    ChatGroupsService,
    DirectMessagesService,
    ChatGroupsRepository,
    DirectMessagesRepository,
    GroupMessagesRepository,
  ],
  exports: [],
})
export class ChatModule {}
