import { BaseEntity } from '@core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'direct_messages' })
export class DirectMessage extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.sentDirectMessages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedDirectMessages)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
