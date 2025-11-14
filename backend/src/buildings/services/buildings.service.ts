import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuildingsRepository } from '../repositories/buildings.repository';
import { VillagesRepository } from 'src/villages/repositories/villages.repository';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { UpdateBuildingDto } from '../dto/update-building.dto';
import { Building } from '../entities/building.entity';
import { CreateBuildingWsDto } from '../dto/create-building-ws.dto';
import { DeleteBuildingWsDto } from '../dto/delete-building-ws.dto';
import { MoveBuildingWsDto } from '../dto/move-building-ws.dto';

@Injectable()
export class BuildingsService {
  constructor(
    private readonly buildingsRepository: BuildingsRepository,
    @Inject(forwardRef(() => VillagesRepository))
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

  async createForUser(
    userId: number,
    dto: CreateBuildingWsDto,
  ): Promise<Building> {
    const village = await this.villagesRepository.findByUserId(userId);
    if (!village) {
      throw new NotFoundException(
        'Nie znaleziono wioski dla tego użytkownika.',
      );
    }

    const existingBuilding =
      await this.buildingsRepository.findByVillageIdAndCoords(
        village.id,
        dto.row,
        dto.col,
      );
    if (existingBuilding) {
      throw new ConflictException(
        `Na polu [${dto.row}, ${dto.col}] już istnieje budynek.`,
      );
    }

    const imageUrl = `assets/buildings/${dto.name}.png`;
    const defaultHealth = 100;

    const newBuilding = this.buildingsRepository.create({
      name: dto.name,
      level: 1,
      row: dto.row,
      col: dto.col,
      imageUrl,
      health: defaultHealth,
      maxHealth: defaultHealth,
      village: village,
    });

    return this.buildingsRepository.save(newBuilding);
  }

  async moveForUser(userId: number, dto: MoveBuildingWsDto): Promise<void> {
    const village = await this.villagesRepository.findByUserId(userId);
    if (!village) {
      throw new NotFoundException(
        'Nie znaleziono wioski dla tego użytkownika.',
      );
    }

    const buildingToMove = await this.buildingsRepository.findByIdAndVillageId(
      dto.buildingId,
      village.id,
    );
    if (!buildingToMove) {
      throw new NotFoundException(
        'Budynek nie został znaleziony lub nie należy do Twojej wioski.',
      );
    }

    const oldRow = buildingToMove.row;
    const oldCol = buildingToMove.col;

    const targetFieldBuilding =
      await this.buildingsRepository.findByVillageIdAndCoords(
        village.id,
        dto.row,
        dto.col,
      );

    if (targetFieldBuilding && targetFieldBuilding.id !== buildingToMove.id) {
      targetFieldBuilding.row = oldRow;
      targetFieldBuilding.col = oldCol;
      await this.buildingsRepository.save(targetFieldBuilding);
    }

    buildingToMove.row = dto.row;
    buildingToMove.col = dto.col;
    await this.buildingsRepository.save(buildingToMove);
  }

  async removeForUser(userId: number, dto: DeleteBuildingWsDto): Promise<void> {
    const village = await this.villagesRepository.findByUserId(userId);
    if (!village) {
      throw new NotFoundException(
        'Nie znaleziono wioski dla tego użytkownika.',
      );
    }

    this.buildingsRepository.deleteBy({
      id: dto.buildingId,
      village: { id: village.id },
    });
  }
}
