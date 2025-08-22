import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from 'src/core/entities/base.entity';

@Entity({ name: 'clans' })
export class Clan extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => User, (user) => user.clans)
  @JoinTable()
  members: User[];
}
