import { BaseEntity } from '@core/entities/base.entity';
import { BuildingName } from '@core/enums/building-name.enum';
import { Village } from 'src/villages/entities/village.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'buildings' })
export class Building extends BaseEntity {
  @ManyToOne(() => Village, (village) => village.buildings, {
    onDelete: 'CASCADE',
  })
  village: Village;

  @Column({
    type: 'enum',
    enum: BuildingName,
  })
  name: BuildingName;

  @Column({ default: 1 })
  level: number;

  @Column()
  imageUrl: string;

  @Column({ type: 'int', nullable: true })
  health?: number;

  @Column({ type: 'int', nullable: true })
  maxHealth?: number;

  @Column({ type: 'int' })
  row: number;

  @Column({ type: 'int' })
  col: number;

  @Column({ type: 'timestamp', nullable: true })
  constructionFinishedAt: Date | null;
}
