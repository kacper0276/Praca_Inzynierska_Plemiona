import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourcesRepository } from 'src/resources/repositories/resources.repository';
import { ServersRepository } from 'src/servers/repositories/servers.repository';
import { VillagesRepository } from 'src/villages/repositories/villages.repository';
import { Ranking } from '../models/ranking.model';

@Injectable()
export class RankingService {
  constructor(
    private readonly serversRepository: ServersRepository,
    private readonly villagesRepository: VillagesRepository,
    private readonly resourcesRepository: ResourcesRepository,
  ) {}

  async getRankingForServer(
    serverName: string,
    currentUserId: number,
    page: number,
    limit: number,
  ): Promise<{ items: Ranking[]; total: number }> {
    const server = await this.serversRepository.findOne({ name: serverName });

    if (!server) {
      throw new NotFoundException(
        `Serwer o nazwie "${serverName}" nie istnieje.`,
      );
    }

    const villages = await this.villagesRepository.find({
      where: { server: { id: server.id } },
      relations: ['user', 'buildings'],
    });

    const resourcesList = await this.resourcesRepository.find({
      where: { server: { id: server.id } },
      relations: ['user'],
    });

    const userMap = new Map<
      number,
      { login: string; score: number; email: string }
    >();

    for (const village of villages) {
      if (!village.user) continue;
      const uid = village.user.id;

      if (!userMap.has(uid)) {
        userMap.set(uid, {
          login: village.user.login,
          score: 0,
          email: village.user.email,
        });
      }

      const entry = userMap.get(uid)!;

      const buildingLevelPoints = village.buildings.reduce(
        (sum, b) => sum + b.level * 10,
        0,
      );
      const buildingCountPoints = village.buildings.length * 5;

      entry.score += buildingLevelPoints + buildingCountPoints;
    }

    for (const res of resourcesList) {
      if (!res.user) continue;
      const uid = res.user.id;

      if (!userMap.has(uid)) {
        userMap.set(uid, {
          login: res.user.login,
          score: 0,
          email: res.user.email,
        });
      }

      const entry = userMap.get(uid)!;

      const totalRes = res.wood + res.clay + res.iron;
      const resourcePoints = Math.floor(totalRes / 1000);
      const populationPoints = res.population || 0;

      entry.score += resourcePoints + populationPoints;
    }

    const sortedData = Array.from(userMap.entries())
      .map(([userId, data]) => ({ userId: Number(userId), ...data }))
      .sort((a, b) => b.score - a.score);

    const total = sortedData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = sortedData
      .slice(startIndex, endIndex)
      .map((item, index) => ({
        position: startIndex + index + 1,
        username: item.login,
        email: item.email,
        score: item.score,
        server: serverName,
        isYou: item.userId === currentUserId,
      }));

    return {
      items: paginatedData,
      total: total,
    };
  }
}
