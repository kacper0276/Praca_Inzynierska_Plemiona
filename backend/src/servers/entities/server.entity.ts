import { BaseEntity } from '@core/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ServerStatusLog } from './server-status-log.entity';
import { ServerStatus } from '../enums/server-status.enum';
import { Village } from 'src/villages/entities/village.entity';

@Entity({ name: 'servers' })
export class Server extends BaseEntity {
  @Column()
  name: string;

  @Column()
  hostname: string;

  @Column({ type: 'int' })
  port: number;

  @Column({
    type: 'enum',
    enum: ServerStatus,
    default: ServerStatus.UNKNOWN,
  })
  status: ServerStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastChecked: Date;

  @OneToMany(() => ServerStatusLog, (log) => log.server)
  logs: ServerStatusLog[];

  @OneToMany(() => Village, (village) => village.server)
  villages: Village[];
}
