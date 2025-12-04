import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '@core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'reports' })
export class Report extends BaseEntity {
  @ManyToOne(() => User, (u) => (u as any).reports, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  reporter: User;

  @ManyToOne(() => User, (u) => (u as any).reportsAgainst, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  targetUser?: User;

  @Column()
  title: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ default: false })
  isResolved: boolean;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt?: Date;

  @ManyToOne(() => User, (u) => (u as any).resolvedReports, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  resolver?: User;
}
