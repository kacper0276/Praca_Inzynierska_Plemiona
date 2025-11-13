import { Injectable, NotFoundException } from '@nestjs/common';
import { BuildingsRepository } from '../repositories/buildings.repository';
import { VillagesRepository } from 'src/villages/repositories/villages.repository';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { UpdateBuildingDto } from '../dto/update-building.dto';
import { Building } from '../entities/building.entity';

@Injectable()
export class BuildingsService {
  constructor(
    private readonly buildingsRepository: BuildingsRepository,
    private readonly villagesRepository: VillagesRepository,
  ) {}

  findAllForVillage(villageId: number) {
    return this.buildingsRepository.findAllByVillageId(villageId);
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingsRepository.findOneById(id, {
      relations: ['village'],
    });
    if (!building) {
      throw new NotFoundException(`Budynek o ID ${id} nie został znaleziony.`);
    }
    return building;
  }

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const { villageId, name, ...buildingData } = createBuildingDto;

    const village = await this.villagesRepository.findOneById(villageId);
    if (!village) {
      throw new NotFoundException(
        `Wioska o ID ${villageId} nie została znaleziona.`,
      );
    }

    const imageUrl = buildingData.imageUrl || `assets/buildings/${name}.png`;

    const newBuilding = this.buildingsRepository.create({
      ...buildingData,
      name,
      imageUrl,
      health: buildingData.health ?? buildingData.maxHealth ?? 100,
      maxHealth: buildingData.maxHealth ?? 100,
      village: village,
    });

    return this.buildingsRepository.save(newBuilding);
  }

  async update(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.findOne(id);

    if (updateBuildingDto.villageId) {
      delete updateBuildingDto.villageId;
    }

    Object.assign(building, updateBuildingDto);
    return this.buildingsRepository.save(building);
  }

  async remove(id: number): Promise<void> {
    const building = await this.findOne(id);
    await this.buildingsRepository.delete(building.id);
  }
}
