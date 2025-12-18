import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
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

  @OneToOne(() => User, (user) => user.foundedClan)
  @JoinColumn({ name: 'founderId' })
  founder: User;

  @OneToMany(() => User, (user) => user.clan)
  members: User[];

  @ManyToOne(() => Server, (server) => server.clans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serverId' })
  server: Server;
}
