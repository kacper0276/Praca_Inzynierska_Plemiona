import { Column, Entity, OneToMany, ManyToMany } from 'typeorm';
import { Clan } from '../../clans/entities/clan.entity';
import { BaseEntity } from '../../core/entities/base.entity';
import { Role } from '../../core/enums/role.enum';
import { Resources } from 'src/resources/entities/resources.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

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

  @OneToMany(() => Resources, (resources) => resources.user)
  resources: Resources[];

  @ManyToMany(() => Clan, (clan) => clan.members)
  clans: Clan[];
}
