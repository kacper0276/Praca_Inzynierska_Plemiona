import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @OneToOne(() => User, (user) => user.resources, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
