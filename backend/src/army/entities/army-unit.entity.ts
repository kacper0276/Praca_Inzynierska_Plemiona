import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@core/entities/base.entity';
import { Village } from 'src/villages/entities/village.entity';
import { UnitType } from '@core/enums/unit-type.enum';

@Entity({ name: 'army_units' })
@Unique(['village', 'type'])
export class ArmyUnit extends BaseEntity {
  @Column({
    type: 'enum',
    enum: UnitType,
    default: UnitType.WARRIOR,
  })
  type: UnitType;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @ManyToOne(() => Village, (village) => village.armyUnits, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  village: Village;
}
