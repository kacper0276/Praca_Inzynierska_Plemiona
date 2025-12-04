import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Building } from 'src/buildings/entities/building.entity';
import { Server } from 'src/servers/entities/server.entity';

@Entity({ name: 'villages' })
export class Village extends BaseEntity {
  @ManyToOne(() => User, (u) => u.villages, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Building, (building) => building.village, {
    cascade: true,
    eager: true,
  })
  buildings: Building[];

  @Column({ default: 5 })
  gridSize: number;

  @Column({ default: 0 })
  centerX: number;

  @Column({ default: 0 })
  centerY: number;

  @ManyToOne(() => Server, (server) => server.id)
  server: Server;
}
