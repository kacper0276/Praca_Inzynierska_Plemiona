import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Server } from 'src/servers/entities/server.entity';

@Entity()
export class Resources {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  wood: number;

  @Column({ default: 0 })
  clay: number;

  @Column({ default: 0 })
  iron: number;

  @Column({ default: 0 })
  population: number;

  @Column({ default: 0 })
  maxPopulation: number;

  @ManyToOne(() => User, (user) => user.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Server, (server) => server.id)
  server: Server;
}
