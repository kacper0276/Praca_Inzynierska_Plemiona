import {
  BadRequestException,
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
import { ResourcesRepository } from 'src/resources/repositories/resources.repository';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BUILDING_COSTS } from 'src/core/consts/building-costs';
import { BuildingName } from 'src/core/enums/building-name.enum';
import { Village } from 'src/villages/entities/village.entity';
import { Resources } from 'src/resources/entities/resources.entity';
import { WsGateway } from 'src/core/gateways/ws.gateway';
import { WsEvent } from 'src/core/enums/ws-event.enum';

@Injectable()
export class BuildingsService {
  constructor(
    private readonly buildingsRepository: BuildingsRepository,
    @Inject(forwardRef(() => VillagesRepository))
    private readonly villagesRepository: VillagesRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(forwardRef(() => WsGateway)) private readonly wsGateway: WsGateway,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedBuilding: Building;
    let updatedResources: Resources;

    try {
      const villageRepository = queryRunner.manager.getRepository(Village);
      const buildingRepository = queryRunner.manager.getRepository(Building);
      const resourcesRepository = queryRunner.manager.getRepository(Resources);

      const village = await villageRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!village) {
        throw new NotFoundException(
          'Nie znaleziono wioski dla tego użytkownika.',
        );
      }

      const existingBuilding = await buildingRepository.findOne({
        where: { village: { id: village.id }, row: dto.row, col: dto.col },
      });
      if (existingBuilding) {
        throw new ConflictException(
          `Na polu [${dto.row}, ${dto.col}] już istnieje budynek.`,
        );
      }

      const buildingCost = BUILDING_COSTS[dto.name as BuildingName];
      if (!buildingCost) {
        throw new BadRequestException(
          `Nieprawidłowa nazwa budynku: ${dto.name}`,
        );
      }

      const userResources = await resourcesRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!userResources) {
        throw new NotFoundException(
          `Nie znaleziono zasobów dla użytkownika o ID: ${userId}`,
        );
      }

      if (
        userResources.wood < buildingCost.wood ||
        userResources.clay < buildingCost.clay ||
        userResources.iron < buildingCost.iron
      ) {
        throw new ConflictException('Niewystarczające zasoby do budowy.');
      }

      userResources.wood -= buildingCost.wood;
      userResources.clay -= buildingCost.clay;
      userResources.iron -= buildingCost.iron;
      updatedResources = await resourcesRepository.save(userResources);

      const imageUrl = `assets/buildings/${dto.name}.png`;
      const defaultHealth = 100;

      const newBuilding = buildingRepository.create({
        name: dto.name,
        level: 1,
        row: dto.row,
        col: dto.col,
        imageUrl,
        health: defaultHealth,
        maxHealth: defaultHealth,
        village: village,
      });
      savedBuilding = await buildingRepository.save(newBuilding);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    if (updatedResources) {
      this.wsGateway.sendToUser(
        userId,
        WsEvent.RESOURCE_UPDATE,
        updatedResources,
      );
    }

    return savedBuilding;
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
