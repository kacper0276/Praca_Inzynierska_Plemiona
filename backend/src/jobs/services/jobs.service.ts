import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServerStatus } from 'src/servers/enums/server-status.enum';
import { ServersService } from 'src/servers/services/servers.service';
import { UsersRepository } from 'src/users/repositories/users.repository';
import * as net from 'net';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly serversService: ServersService,
  ) {}

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

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleServerStatusCheck() {
    this.logger.log('Uruchamianie zadania sprawdzania statusu serwerów...');

    const servers = await this.serversService.findAll();

    if (servers.length === 0) {
      this.logger.log('Nie znaleziono serwerów do sprawdzenia.');
      return;
    }

    for (const server of servers) {
      const isOnline = await this.isServerOnline(server.hostname, server.port);
      const newStatus = isOnline ? ServerStatus.ONLINE : ServerStatus.OFFLINE;

      if (server.status !== newStatus) {
        this.logger.log(
          `Zmiana statusu dla serwera "${server.name}": z ${server.status} na ${newStatus}`,
        );
        await this.serversService.updateServerStatus(server.id, newStatus);
      }
    }
  }

  private isServerOnline(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const onError = () => {
        socket.destroy();
        resolve(false);
      };
      socket.setTimeout(2000);
      socket.once('error', onError);
      socket.once('timeout', onError);
      socket.connect(port, host, () => {
        socket.end();
        resolve(true);
      });
    });
  }
}
