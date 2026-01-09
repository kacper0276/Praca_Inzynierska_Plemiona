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
import { DataSource, LessThanOrEqual } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BUILDING_COSTS } from '@core/consts/building-costs';
import { BuildingName } from '@core/enums/building-name.enum';
import { Village } from 'src/villages/entities/village.entity';
import { Resources } from 'src/resources/entities/resources.entity';
import { WsGateway } from '@core/gateways/ws.gateway';
import { WsEvent } from '@core/enums/ws-event.enum';
import { UpgradeBuildingWsDto } from '../dto/upgrade-building-ws.dto';
import { ResourcesService } from 'src/resources/services/resources.service';

@Injectable()
export class BuildingsService {
  constructor(
    private readonly buildingsRepository: BuildingsRepository,
    @Inject(forwardRef(() => VillagesRepository))
    private readonly villagesRepository: VillagesRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(forwardRef(() => WsGateway)) private readonly wsGateway: WsGateway,
    @Inject(forwardRef(() => ResourcesService))
    private readonly resourcesService: ResourcesService,
  ) {}

  async findAll() {
    const buildings = await this.buildingsRepository.findAll({
      relations: ['village', 'village.user'],
    });

    const mappedBuildings = buildings.map((building) => {
      return {
        ...building,
        userLogin: building.village.user.login,
        userVillageId: building.village.id,
      };
    });

    return mappedBuildings;
  }

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
        where: { user: { id: userId }, server: { id: dto.serverId } },
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

      const imageUrl = `assets/buildings/${dto.name}.png`;
      const defaultHealth = 100;

      const constructionTime = 30 * 1000;
      const finishedAt = new Date(Date.now() + constructionTime);

      const newBuilding = buildingRepository.create({
        name: dto.name,
        level: 1,
        row: dto.row,
        col: dto.col,
        imageUrl,
        health: defaultHealth,
        maxHealth: defaultHealth,
        village: village,
        constructionFinishedAt: finishedAt,
      });
      savedBuilding = await buildingRepository.save(newBuilding);

      if (savedBuilding.name === BuildingName.RESIDENTIAL_HOUSE) {
        updatedResources = await this.resourcesService.increaseMaxPopulation(
          userId,
          dto.serverId,
          1,
          queryRunner.manager,
          userResources,
        );
      } else {
        updatedResources = await resourcesRepository.save(userResources);
      }

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

  async startUpgradeForUser(
    userId: number,
    dto: UpgradeBuildingWsDto,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let updatedResources: Resources;
    let savedBuilding: Building;

    try {
      const buildingRepository = queryRunner.manager.getRepository(Building);
      const resourcesRepository = queryRunner.manager.getRepository(Resources);

      const building = await buildingRepository.findOne({
        where: { id: dto.buildingId, village: { user: { id: userId } } },
      });

      if (!building) throw new NotFoundException('Budynek nie istnieje.');
      if (building.constructionFinishedAt)
        throw new ConflictException(
          'Budynek jest w trakcie budowy lub ulepszania.',
        );

      const baseCost = BUILDING_COSTS[building.name as BuildingName];
      const multiplier = Math.pow(1.2, building.level);
      const cost = {
        wood: Math.ceil(baseCost.wood * multiplier),
        clay: Math.ceil(baseCost.clay * multiplier),
        iron: Math.ceil(baseCost.iron * multiplier),
      };

      const userResources = await resourcesRepository.findOne({
        where: { user: { id: userId } },
      });

      if (
        userResources.wood < cost.wood ||
        userResources.clay < cost.clay ||
        userResources.iron < cost.iron
      ) {
        throw new ConflictException('Niewystarczające zasoby.');
      }

      userResources.wood -= cost.wood;
      userResources.clay -= cost.clay;
      userResources.iron -= cost.iron;
      updatedResources = await resourcesRepository.save(userResources);

      const upgradeTime = 60 * 1000 * building.level;
      building.constructionFinishedAt = new Date(Date.now() + upgradeTime);

      savedBuilding = await buildingRepository.save(building);
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

    return {
      ...savedBuilding,
      upgradeFinishedAt: savedBuilding.constructionFinishedAt,
      constructionFinishedAt: null,
    };
  }

  async finalizeUpgrade(buildingId: number): Promise<Building> {
    const building = await this.buildingsRepository.findOneById(buildingId, {
      relations: ['village', 'village.user', 'village.server'],
    });

    if (!building) {
      throw new NotFoundException('Budynek nie istnieje.');
    }

    building.level += 1;
    building.maxHealth += 10;
    building.health = building.maxHealth;
    building.constructionFinishedAt = null;

    const savedBuilding = await this.buildingsRepository.save(building);

    if (savedBuilding.name === BuildingName.RESIDENTIAL_HOUSE) {
      await this.resourcesService.increaseMaxPopulation(
        building.village.user.id,
        building.village.server.id,
        savedBuilding.level,
      );
    }

    return savedBuilding;
  }

  async startRepairForUser(userId: number, buildingId: number): Promise<any> {
    const building = await this.buildingsRepository.findOne({
      id: buildingId,
      village: { user: { id: userId } as any } as any,
    });

    if (!building) {
      throw new NotFoundException('Budynek nie został znaleziony.');
    }

    if (building.health >= building.maxHealth) {
      throw new ConflictException('Budynek nie wymaga naprawy.');
    }

    if (building.constructionFinishedAt) {
      throw new ConflictException('Budynek jest zajęty (budowa/ulepszanie).');
    }

    const missingHealth = building.maxHealth - building.health;
    const repairTime = Math.max(5000, missingHealth * 500);

    building.constructionFinishedAt = new Date(Date.now() + repairTime);

    const savedBuilding = await this.buildingsRepository.save(building);

    return {
      ...savedBuilding,
      repairFinishedAt: savedBuilding.constructionFinishedAt,
      constructionFinishedAt: null,
    };
  }

  async finalizeRepair(buildingId: number): Promise<Building> {
    const building = await this.buildingsRepository.findOneById(buildingId);
    if (!building) {
      throw new NotFoundException('Budynek nie istnieje.');
    }

    building.health = building.maxHealth;
    building.constructionFinishedAt = null;

    return this.buildingsRepository.save(building);
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

  async processFinishedConstructions(): Promise<void> {
    const now = new Date();
    const finishedBuildings = await this.buildingsRepository.findAll({
      where: { constructionFinishedAt: LessThanOrEqual(now) },
      relations: ['village', 'village.user', 'village.server'],
    });
    for (const building of finishedBuildings) {
      building.constructionFinishedAt = null;

      const savedBuilding = await this.buildingsRepository.save(building);

      const userId = building.village.user.id;

      this.wsGateway.sendToUser(
        userId,
        WsEvent.BUILDING_FINISHED,
        savedBuilding,
      );
    }
  }
}
