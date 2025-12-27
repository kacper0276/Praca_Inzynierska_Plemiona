import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '@core/entities/base.entity';
import { Server } from 'src/servers/entities/server.entity';

@Entity({ name: 'clans' })
export class Clan extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.foundedClans)
  @JoinColumn({ name: 'founderId' })
  founder: User;

  @ManyToMany(() => User, (user) => user.clans)
  @JoinTable({ name: 'clan_members' })
  members: User[];

  @ManyToOne(() => Server, (server) => server.clans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serverId' })
  server: Server;
}
