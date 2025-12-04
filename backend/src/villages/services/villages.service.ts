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

@Injectable()
export class VillagesService {
  constructor(
    private readonly villagesRepository: VillagesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly resourcesService: ResourcesService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getByUserId(userId: number): Promise<Village> {
    const village = await this.villagesRepository.findByUserId(userId);

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
        where: { user: { id: userId } },
        relations: ['user', 'buildings'],
      });

      if (!village) {
        throw new Error('Nie znaleziono wioski dla tego użytkownika.');
      }

      if (village.gridSize >= 11) {
        throw new Error('Osiągnięto maksymalny rozmiar wioski.');
      }

      const canAfford = await this.resourcesService.hasEnoughResources(
        village.user.id,
        expandDto.cost,
      );

      if (!canAfford) {
        throw new Error('Niewystarczające surowce do rozbudowy.');
      }

      await this.resourcesService.spendResources(
        village.user.id,
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
}
