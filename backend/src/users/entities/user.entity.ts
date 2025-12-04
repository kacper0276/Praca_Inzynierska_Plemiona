import {
  Column,
  Entity,
  ManyToMany,
  JoinTable,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Clan } from '../../clans/entities/clan.entity';
import { BaseEntity } from '../../core/entities/base.entity';
import { Resources } from 'src/resources/entities/resources.entity';
import { UserRole } from '@core/enums/user-role.enum';
import { Village } from 'src/villages/entities/village.entity';
import { FriendRequest } from '../../friend-requests/entities/friend-request.entity';
import { DirectMessage } from 'src/chat/entities/direct-message.entity';
import { ChatGroup } from 'src/chat/entities/chat-group.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'longtext', nullable: true })
  profileImage: string;

  @Column({ type: 'longtext', nullable: true })
  backgroundImage: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: '' })
  bio: string;

  @Column({ default: null })
  deleteAt: Date | null;

  @OneToOne(() => Resources, (resources) => resources.user)
  resources: Resources;

  @OneToMany(() => Village, (village) => village.user)
  villages: Village[];

  @ManyToMany(() => Clan, (clan) => clan.members)
  clans: Clan[];

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable({ name: 'user_friends' })
  friends: User[];

  @OneToMany(() => FriendRequest, (request) => request.sender)
  sentFriendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (request) => request.receiver)
  receivedFriendRequests: FriendRequest[];

  @OneToMany(() => DirectMessage, (message) => message.sender)
  sentDirectMessages: DirectMessage[];

  @OneToMany(() => DirectMessage, (message) => message.receiver)
  receivedDirectMessages: DirectMessage[];

  @ManyToMany(() => ChatGroup, (group) => group.members)
  chatGroups: ChatGroup[];
}
