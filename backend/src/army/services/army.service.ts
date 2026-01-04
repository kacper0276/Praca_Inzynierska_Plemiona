import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArmyRepository } from '../repositories/army.repository';
import { ResourcesService } from 'src/resources/services/resources.service';
import { DataSource } from 'typeorm';
import { WsGateway } from '@core/gateways/ws.gateway';
import { WsEvent } from '@core/enums/ws-event.enum';
import { Village } from 'src/villages/entities/village.entity';
import { RecruitUnitDto } from '../dto/recruit-unit.dto';
import { ArmyUnit } from '../entities/army-unit.entity';
import { ARMY_COSTS } from '@core/consts/army-costs';
import { UpgradeUnitDto } from '../dto/upgrade-unit.dto';

@Injectable()
export class ArmyService {
  constructor(
    private readonly armyRepository: ArmyRepository,
    private readonly resourcesService: ResourcesService,
    private readonly dataSource: DataSource,
    private readonly wsGateway: WsGateway,
  ) {}

  private async findUserVillage(
    userId: number,
    serverId: number,
    manager?: any,
  ) {
    const repo = manager
      ? manager.getRepository(Village)
      : this.dataSource.getRepository(Village);
    const village = await repo.findOne({
      where: {
        user: { id: userId },
        server: { id: serverId },
      },
      relations: ['user', 'server'],
    });

    if (!village) {
      throw new NotFoundException(
        `Nie znaleziono wioski dla użytkownika na serwerze ${serverId}.`,
      );
    }
    return village;
  }

  async getArmyByServerAndUser(
    serverId: number,
    userId: number,
  ): Promise<ArmyUnit[]> {
    const village = await this.findUserVillage(userId, serverId);

    return this.armyRepository.find({
      where: { village: { id: village.id } },
      order: { type: 'ASC' },
    });
  }

  async recruitUnits(userId: number, dto: RecruitUnitDto): Promise<ArmyUnit> {
    const { serverId, unitType, amount } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const village = await this.findUserVillage(
        userId,
        serverId,
        queryRunner.manager,
      );

      const costPerUnit = ARMY_COSTS[unitType];
      const totalCost = {
        wood: (costPerUnit.wood || 0) * amount,
        clay: (costPerUnit.clay || 0) * amount,
        iron: (costPerUnit.iron || 0) * amount,
      };

      const updatedResources = await this.resourcesService.spendResources(
        userId,
        serverId,
        totalCost,
        queryRunner.manager,
      );

      let unit = await queryRunner.manager.findOne(ArmyUnit, {
        where: { village: { id: village.id }, type: unitType },
        lock: { mode: 'pessimistic_write' },
      });

      if (unit) {
        unit.count += amount;
      } else {
        unit = queryRunner.manager.create(ArmyUnit, {
          type: unitType,
          count: amount,
          level: 1,
          village: village,
        });
      }
      unit = await queryRunner.manager.save(unit);

      await queryRunner.commitTransaction();

      this.wsGateway.sendToUser(
        userId,
        WsEvent.RESOURCE_UPDATE,
        updatedResources,
      );

      return unit;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      )
        throw err;
      throw new InternalServerErrorException('Błąd rekrutacji');
    } finally {
      await queryRunner.release();
    }
  }

  async upgradeUnit(userId: number, dto: UpgradeUnitDto): Promise<ArmyUnit> {
    const { serverId, unitType } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const village = await this.findUserVillage(
        userId,
        serverId,
        queryRunner.manager,
      );

      let unit = await queryRunner.manager.findOne(ArmyUnit, {
        where: { village: { id: village.id }, type: unitType },
        lock: { mode: 'pessimistic_write' },
      });

      let currentLevel = 1;
      if (!unit) {
        unit = queryRunner.manager.create(ArmyUnit, {
          village,
          type: unitType,
          count: 0,
          level: 1,
        });
        unit = await queryRunner.manager.save(unit);
      }
      currentLevel = unit.level;
      const nextLevel = currentLevel + 1;

      const baseCost = ARMY_COSTS[unitType];
      const upgradeCost = {
        wood: (baseCost.wood || 0) * nextLevel * 2,
        clay: (baseCost.clay || 0) * nextLevel * 2,
        iron: (baseCost.iron || 0) * nextLevel * 2,
      };

      const updatedResources = await this.resourcesService.spendResources(
        userId,
        serverId,
        upgradeCost,
        queryRunner.manager,
      );

      unit.level = nextLevel;
      await queryRunner.manager.save(unit);

      await queryRunner.commitTransaction();
      this.wsGateway.sendToUser(
        userId,
        WsEvent.RESOURCE_UPDATE,
        updatedResources,
      );

      return unit;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      )
        throw err;
      throw new InternalServerErrorException('Błąd ulepszania');
    } finally {
      await queryRunner.release();
    }
  }
}
