import { Entity, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Server } from './server.entity';
import { ServerStatus } from '../enums/server-status.enum';
import { BaseEntity } from '@core/entities/base.entity';

@Entity({ name: 'server_status_logs' })
export class ServerStatusLog extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ServerStatus,
  })
  status: ServerStatus;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Server, (server) => server.id)
  server: Server;
}
