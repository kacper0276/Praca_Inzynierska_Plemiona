import { BaseEntity } from 'src/core/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ServerStatusLog } from './server-status-log.entity';
import { ServerStatus } from '../enums/server-status.enum';

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
}
