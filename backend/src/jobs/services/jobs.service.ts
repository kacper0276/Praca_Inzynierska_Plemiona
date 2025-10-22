import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersRepository } from 'src/users/repositories/users.repository';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleInactiveUsers() {
    this.logger.log(
      'Uruchamianie zadania czyszczenia nieaktywnych użytkowników...',
    );

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const inactiveUsers =
      await this.usersRepository.findInactiveUsersCreatedBefore(fiveMinutesAgo);

    if (inactiveUsers.length > 0) {
      this.logger.log(
        `Znaleziono ${inactiveUsers.length} nieaktywnych użytkowników do usunięcia.`,
      );
      for (const user of inactiveUsers) {
        await this.usersRepository.delete(user.id);
        this.logger.log(`Usunięto użytkownika o ID: ${user.id}`);
      }
    } else {
      this.logger.log('Nie znaleziono nieaktywnych użytkowników do usunięcia.');
    }
  }
}
