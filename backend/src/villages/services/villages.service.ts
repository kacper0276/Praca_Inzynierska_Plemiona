import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { VillagesRepository } from '../repositories/villages.repository';
import { Village } from '../entities/village.entity';
import { VillageStateDto } from '../dto/village-state.dto';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { BuildingData } from '@core/models/building.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ExpandVillageWsDto } from '../dto/expand-village-ws.dto';
import { ResourcesService } from 'src/resources/services/resources.service';
import { Building } from 'src/buildings/entities/building.entity';
import { Server } from 'src/servers/entities/server.entity';
import { ArmyUnit } from 'src/army/entities/army-unit.entity';
import { Resources } from 'src/resources/entities/resources.entity';

@Injectable()
export class VillagesService {
  constructor(
    private readonly villagesRepository: VillagesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly resourcesService: ResourcesService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async applyBattleResults(
    attackerId: number,
    defenderId: number,
    winner: 'attacker' | 'defender',
    results: {
      attackerUnits: { type: string; count: number }[];
      defenderUnits: { type: string; count: number }[];
      buildings: { id: number; health: number }[];
    },
  ): Promise<{ wood: number; clay: number; iron: number } | null> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let lootedResources = null;

    try {
      const armyRepo = queryRunner.manager.getRepository(ArmyUnit);
      const buildingRepo = queryRunner.manager.getRepository(Building);
      const villageRepo = queryRunner.manager.getRepository(Village);
      const resourcesRepo = queryRunner.manager.getRepository(Resources);

      const attackerVillage = await villageRepo.findOne({
        where: { user: { id: attackerId } },
        relations: ['armyUnits', 'server'],
      });

      if (attackerVillage && attackerVillage.armyUnits) {
        for (const resUnit of results.attackerUnits) {
          const dbUnit = attackerVillage.armyUnits.find(
            (u) => u.type === resUnit.type,
          );
          if (dbUnit) {
            dbUnit.count = Math.max(0, Math.floor(resUnit.count));
            await armyRepo.save(dbUnit);
          }
        }
      }

      const defenderVillage = await villageRepo.findOne({
        where: { user: { id: defenderId } },
        relations: ['armyUnits', 'server'],
      });

      if (defenderVillage && defenderVillage.armyUnits) {
        for (const resUnit of results.defenderUnits) {
          const dbUnit = defenderVillage.armyUnits.find(
            (u) => u.type === resUnit.type,
          );
          if (dbUnit) {
            dbUnit.count = Math.max(0, Math.floor(resUnit.count));
            await armyRepo.save(dbUnit);
          }
        }
      }

      for (const bResult of results.buildings) {
        if (!bResult.id) continue;
        const building = await buildingRepo.findOneBy({ id: bResult.id });
        if (building) {
          building.health = Math.max(0, Math.floor(bResult.health));
          await buildingRepo.save(building);
        }
      }

      if (winner === 'attacker' && attackerVillage && defenderVillage) {
        const attackerRes = await resourcesRepo.findOne({
          where: {
            user: { id: attackerId },
            server: { id: attackerVillage.server.id },
          } as any,
        });

        const defenderRes = await resourcesRepo.findOne({
          where: {
            user: { id: defenderId },
            server: { id: defenderVillage.server.id },
          } as any,
        });

        if (attackerRes && defenderRes) {
          const lootFactor = 0.3;

          const lootWood = Math.floor(defenderRes.wood * lootFactor);
          const lootClay = Math.floor(defenderRes.clay * lootFactor);
          const lootIron = Math.floor(defenderRes.iron * lootFactor);

          defenderRes.wood = Math.max(0, defenderRes.wood - lootWood);
          defenderRes.clay = Math.max(0, defenderRes.clay - lootClay);
          defenderRes.iron = Math.max(0, defenderRes.iron - lootIron);

          attackerRes.wood += lootWood;
          attackerRes.clay += lootClay;
          attackerRes.iron += lootIron;

          await resourcesRepo.save(defenderRes);
          await resourcesRepo.save(attackerRes);

          lootedResources = {
            wood: lootWood,
            clay: lootClay,
            iron: lootIron,
          };
        }
      }

      await queryRunner.commitTransaction();
      return lootedResources;
    } catch (err) {
      console.error('Error saving battle results:', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getByUserId(userId: number, serverId: number): Promise<Village> {
    const village = await this.villagesRepository.findOne({
      user: { id: userId } as any,
      server: { id: serverId } as any,
    });

    if (!village) {
      throw new NotFoundException(
        `Nie znaleziono wioski dla użytkownika o ID ${userId}.`,
      );
    }

    if (village.user) {
      delete (village.user as any).password;
      delete (village.user as any).hashedRefreshToken;
    }
    return village;
  }

  async getVillageForUser(userId: number): Promise<{
    gridSize: number;
    buildings: (BuildingData | null)[][];
  } | null> {
    const conditions = { user: { id: userId } } as any;

    const options = { relations: ['buildings'] };

    const village = await this.villagesRepository.findOne(conditions, options);

    if (!village) {
      return null;
    }

    const grid: (BuildingData | null)[][] = Array(village.gridSize)
      .fill(null)
      .map(() => Array(village.gridSize).fill(null));

    for (const building of village.buildings) {
      if (building.row < village.gridSize && building.col < village.gridSize) {
        grid[building.row][building.col] = {
          id: building.id,
          name: building.name,
          level: building.level,
          imageUrl: building.imageUrl,
          health: building.health,
          maxHealth: building.maxHealth,
        };
      }
    }

    return {
      gridSize: village.gridSize,
      buildings: grid,
    };
  }

  async getVillageForUserAndServerId(
    userId: number,
    serverId: number,
  ): Promise<{
    gridSize: number;
    buildings: (BuildingData | null)[][];
  } | null> {
    const conditions = {
      user: { id: userId },
      server: { id: serverId },
    } as any;

    const options = { relations: ['buildings'] };

    let village = await this.villagesRepository.findOne(conditions, options);

    if (!village) {
      const user = await this.usersRepository.findOneById(userId);
      const serverRepo = this.dataSource.getRepository(Server);
      const server = await serverRepo.findOneBy({ id: serverId });

      if (!user || !server) {
        throw new NotFoundException('Nie znaleziono użytkownika lub serwera.');
      }

      village = this.villagesRepository.create({
        user: user,
        server: server,
        gridSize: 5,
        buildings: [],
      });

      village = await this.villagesRepository.save(village);
    }

    const grid: (BuildingData | null)[][] = Array(village.gridSize)
      .fill(null)
      .map(() => Array(village.gridSize).fill(null));

    for (const building of village.buildings) {
      if (building.row < village.gridSize && building.col < village.gridSize) {
        grid[building.row][building.col] = {
          id: building.id,
          name: building.name,
          level: building.level,
          imageUrl: building.imageUrl,
          health: building.health,
          maxHealth: building.maxHealth,
          constructionFinishedAt: building.constructionFinishedAt,
        };
      }
    }

    return {
      gridSize: village.gridSize,
      buildings: grid,
    };
  }

  async createForUser(
    userId: number,
    villageStateDto: VillageStateDto,
  ): Promise<Village> {
    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`Użytkownik o ID ${userId} nie istnieje.`);
    }

    const existingVillage = await this.villagesRepository.findByUserId(userId);

    if (existingVillage) {
      throw new ConflictException(
        `Użytkownik o ID ${userId} już posiada wioskę.`,
      );
    }

    const village = this.villagesRepository.create({
      ...villageStateDto,
      user: user,
    });
    return this.villagesRepository.save(village);
  }

  async updateVillage(
    id: number,
    villageStateDto: VillageStateDto,
  ): Promise<Village> {
    const village = await this.villagesRepository.findOneById(id);
    if (!village) {
      throw new NotFoundException(`Wioska o ID ${id} nie została znaleziona.`);
    }

    Object.assign(village, villageStateDto);
    return this.villagesRepository.save(village);
  }

  async deleteVillage(id: number): Promise<void> {
    await this.villagesRepository.delete(id);
  }

  async expandVillage(
    userId: number,
    expandDto: ExpandVillageWsDto,
  ): Promise<Village> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const villageRepo = queryRunner.manager.getRepository(Village);
      const buildingRepo = queryRunner.manager.getRepository(Building);

      const village = await villageRepo.findOne({
        where: {
          user: { id: userId },
          server: { id: expandDto.serverId },
        } as any,
        relations: ['user', 'buildings', 'server'],
      });

      if (!village) {
        throw new Error('Nie znaleziono wioski dla tego użytkownika.');
      }

      if (village.gridSize >= 11) {
        throw new Error('Osiągnięto maksymalny rozmiar wioski.');
      }

      const canAfford = await this.resourcesService.hasEnoughResources(
        village.user.id,
        village.server.id,
        expandDto.cost,
      );

      if (!canAfford) {
        throw new Error('Niewystarczające surowce do rozbudowy.');
      }

      await this.resourcesService.spendResources(
        village.user.id,
        village.server.id,
        expandDto.cost,
        queryRunner.manager,
      );

      village.gridSize += 1;

      if (expandDto.side === 'left') {
        for (const building of village.buildings) {
          building.col += 1;
          await buildingRepo.save(building);
        }
      }

      const updatedVillage = await villageRepo.save(village);

      await queryRunner.commitTransaction();

      return updatedVillage;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMapData(
    serverId: number,
    centerX: number,
    centerY: number,
    range: number,
  ) {
    const allVillages = await this.villagesRepository.find({
      where: {
        server: { id: serverId },
      } as any,
      relations: ['user'],
      select: {
        id: true,
        gridSize: true,
        user: {
          email: true,
        },
      } as any,
    });

    const minX = centerX - Math.floor(range / 2);
    const maxX = centerX + Math.floor(range / 2);
    const minY = centerY - Math.floor(range / 2);
    const maxY = centerY + Math.floor(range / 2);

    const simulatedMap = allVillages
      .map((v) => {
        const idx = v.id - 1;
        const rowWidth = 5;
        const offset = 2;

        const simulatedX = (idx % rowWidth) - offset;
        const simulatedY = Math.floor(idx / rowWidth) - offset;

        return {
          id: v.id,
          name: `Wioska ${v.user?.email || 'Nieznana'}`,
          x: simulatedX,
          y: simulatedY,
          playerName: v.user?.email || 'Unknown',
        };
      })
      .filter((v) => {
        return v.x >= minX && v.x <= maxX && v.y >= minY && v.y <= maxY;
      });

    return simulatedMap;
  }
}
