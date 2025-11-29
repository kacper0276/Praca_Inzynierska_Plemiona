import { BaseEntity } from 'src/core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ChatGroup } from './chat-group.entity';

@Entity({ name: 'group_messages' })
export class GroupMessage extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => ChatGroup, (group) => group.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: ChatGroup;
}
