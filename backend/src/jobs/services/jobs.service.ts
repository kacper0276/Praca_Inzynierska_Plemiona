import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServerStatus } from 'src/servers/enums/server-status.enum';
import { ServersService } from 'src/servers/services/servers.service';
import { UsersRepository } from 'src/users/repositories/users.repository';
import * as net from 'net';
import { WsGateway } from 'src/core/gateways/ws.gateway';
import { ResourcesService } from 'src/resources/services/resources.service';
import { BuildingsService } from 'src/buildings/services/buildings.service';
import { WsEvent } from 'src/core/enums/ws-event.enum';
import { Building } from 'src/buildings/entities/building.entity';
import { BuildingName } from 'src/core/enums/building-name.enum';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly serversService: ServersService,
    private readonly resourcesService: ResourcesService,
    private readonly buildingsService: BuildingsService,
    private readonly wsGateway: WsGateway,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async handleBuildingConstruction() {
    await this.buildingsService.processFinishedConstructions();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMarkInactiveUsersForDeletion() {
    this.logger.log(
      'Uruchamianie zadania oznaczania nieaktywnych użytkowników do usunięcia...',
    );

    const inactiveUsers =
      await this.usersRepository.findInactiveUsersNotMarkedForDeletion();

    if (inactiveUsers.length === 0) {
      this.logger.log(
        'Nie znaleziono nowych nieaktywnych użytkowników do oznaczenia.',
      );
      return;
    }

    this.logger.log(
      `Znaleziono ${inactiveUsers.length} nieaktywnych użytkowników do oznaczenia.`,
    );

    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    for (const user of inactiveUsers) {
      user.deleteAt = fiveDaysFromNow;
      await this.usersRepository.save(user);
      this.logger.log(
        `Użytkownik o ID: ${user.id} został oznaczony do usunięcia w dniu ${fiveDaysFromNow.toISOString()}.`,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleDeleteMarkedUsers() {
    this.logger.log(
      'Uruchamianie zadania usuwania oznaczonych użytkowników...',
    );

    const now = new Date();

    const usersToDelete =
      await this.usersRepository.findInactiveUsersMarkedToDeleteBefore(now);

    if (usersToDelete.length > 0) {
      this.logger.log(
        `Znaleziono ${usersToDelete.length} użytkowników do usunięcia.`,
      );
      for (const user of usersToDelete) {
        await this.usersRepository.delete(user.id);
        this.logger.log(
          `Usunięto użytkownika o ID: ${user.id}, email: ${user.email}`,
        );
      }
    } else {
      this.logger.log(
        'Nie znaleziono użytkowników, których termin usunięcia minął.',
      );
    }
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async handleResourceGeneration() {
    this.logger.log('Uruchamianie zadania generowania surowców...');

    const users = await this.usersRepository.findUsersLoggedIn({
      relations: [
        'currentServer',
        'villages',
        'villages.server',
        'villages.buildings',
      ],
    });

    if (users.length === 0) return;

    for (const user of users) {
      if (!user.currentServer) continue;

      const currentVillage = user.villages?.find(
        (v) => v.server?.id === user.currentServer.id,
      );

      if (
        !currentVillage ||
        !currentVillage.buildings ||
        currentVillage.buildings.length === 0
      ) {
        continue;
      }

      const production = this.calculateProduction(currentVillage.buildings);

      if (Object.values(production).every((v) => v === 0)) continue;

      const updatedResources = await this.resourcesService.updateResources(
        user.id,
        user.currentServer.id,
        production,
      );

      if (updatedResources) {
        this.wsGateway.sendToUser(
          user.id,
          WsEvent.RESOURCE_UPDATE,
          updatedResources,
        );
      }
    }
  }

  private calculateProduction(buildings: Building[]): {
    wood: number;
    clay: number;
    iron: number;
  } {
    const production = { wood: 0, clay: 0, iron: 0 };

    for (const building of buildings) {
      if (building.constructionFinishedAt) continue;

      const level = building.level || 1;

      switch (building.name) {
        case BuildingName.SAWMILL:
          production.wood += 10 * level;
          break;
        case BuildingName.CLAY_PIT:
          production.clay += 7 * level;
          break;
        case BuildingName.SMITHY:
          production.iron += 5 * level;
          break;
        default:
          break;
      }
    }
    return production;
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
