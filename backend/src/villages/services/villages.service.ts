import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { VillagesRepository } from '../repositories/villages.repository';
import { Village } from '../entities/village.entity';
import { VillageStateDto } from '../dto/village-state.dto';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { BuildingData } from 'src/core/models/building.model';

@Injectable()
export class VillagesService {
  constructor(
    private readonly villagesRepository: VillagesRepository,
    private readonly usersRepository: UsersRepository,
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
}
