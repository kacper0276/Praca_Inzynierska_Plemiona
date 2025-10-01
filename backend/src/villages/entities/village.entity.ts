import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'villages' })
export class Village extends BaseEntity {
  @ManyToOne(() => User, (u) => (u as any).villages, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'longtext', nullable: false })
  gridJson: string;

  @Column({ type: 'longtext', nullable: true })
  buildingsJson: string;

  @Column({ default: 0 })
  centerX: number;

  @Column({ default: 0 })
  centerY: number;
}
