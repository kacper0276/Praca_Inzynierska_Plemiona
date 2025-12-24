import { BaseEntity } from '@core/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Unique, ManyToOne, Column, OneToMany } from 'typeorm';
import { Quest } from './quest.entity';
import { UserObjectiveProgress } from './user-objective-progress.entity';
import { Server } from 'src/servers/entities/server.entity';

@Entity({ name: 'user_quest_progress' })
@Unique(['user', 'server', 'quest'])
export class UserQuestProgress extends BaseEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Server)
  server: Server;

  @ManyToOne(() => Quest)
  quest: Quest;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @OneToMany(
    () => UserObjectiveProgress,
    (objProgress) => objProgress.userQuest,
    { cascade: true },
  )
  objectivesProgress: UserObjectiveProgress[];
}
