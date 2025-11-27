import { BaseEntity } from 'src/core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { GroupMessage } from './group-message.entity';

@Entity({ name: 'chat_groups' })
export class ChatGroup extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => GroupMessage, (message) => message.group)
  messages: GroupMessage[];

  @ManyToMany(() => User, (user) => user.chatGroups)
  @JoinTable({
    name: 'chat_group_members',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  members: User[];
}
