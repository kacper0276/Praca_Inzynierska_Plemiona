import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Resources } from '../entities/resources.entity';
import { ResourcesRepository } from '../repositories/resources.repository';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { DataSource, EntityManager } from 'typeorm';
import { ResourceCost } from '@core/consts/building-costs';
import { TransferResourcesDto } from '../dto/transfer-resources.dto';
import { WsGateway } from '@core/gateways/ws.gateway';
import { WsEvent } from '@core/enums/ws-event.enum';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly repository: ResourcesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => WsGateway)) private readonly wsGateway: WsGateway,
  ) {}

  findAll() {
    return this.repository.findAll({ relations: ['user', 'server'] });
  }

  async findOne(id: number) {
    const resource = await this.repository.findOne(
      { id },
      { relations: ['user', 'server'] },
    );
    if (!resource) {
      throw new NotFoundException(`Zasób o ID ${id} nie został znaleziony.`);
    }
    return resource;
  }

  async findOrCreateByUserEmailAndServerId(
    email: string,
    serverId: number,
  ): Promise<Resources> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException(
        `Użytkownik o emailu ${email} nie został znaleziony.`,
      );
    }

    const existingResource = await this.repository.findOne(
      {
        user: { id: user.id },
        server: { id: serverId },
      } as any,
      { relations: ['user', 'server'] },
    );

    if (existingResource) {
      return existingResource;
    }

    const newResource = this.repository.create({
      user: user,
      server: { id: serverId } as any,
      wood: 100,
      clay: 100,
      iron: 100,
      population: 2,
      maxPopulation: 10,
    });

    return this.repository.save(newResource);
  }

  async create(data: CreateResourceDto): Promise<Resources> {
    const { userId, serverId, ...resourceData } = data as any;
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new NotFoundException(
        `Użytkownik o ID ${userId} nie został znaleziony.`,
      );
    }

    const resource = this.repository.create({
      ...resourceData,
      user: user,
      server: { id: serverId },
    });

    return this.repository.save(resource);
  }

  async update(id: number, data: UpdateResourceDto) {
    await this.findOne(id);
    return this.repository.update(id, data);
  }

  async updateResources(
    userId: number,
    serverId: number,
    resourcesToAdd: {
      wood: number;
      clay: number;
      iron: number;
    },
  ) {
    const userResources = await this.repository.findOne({
      user: { id: userId },
      server: { id: serverId },
    } as any);

    if (!userResources) {
      return null;
    }

    userResources.wood += resourcesToAdd.wood;
    userResources.clay += resourcesToAdd.clay;
    userResources.iron += resourcesToAdd.iron;

    return this.repository.save(userResources);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async spendResources(
    userId: number,
    serverId: number,
    cost: Partial<Resources>,
    transactionalManager?: EntityManager,
  ): Promise<void> {
    const repo = transactionalManager
      ? transactionalManager.getRepository(Resources)
      : this.repository;

    const userResources = await repo.findOne({
      where: {
        user: { id: userId },
        server: { id: serverId },
      },
    });

    if (!userResources) {
      throw new Error(
        'Nie znaleziono zasobów użytkownika na podanym serwerze.',
      );
    }

    if (
      userResources.wood < (cost.wood || 0) ||
      userResources.clay < (cost.clay || 0) ||
      userResources.iron < (cost.iron || 0)
    ) {
      throw new Error('Niewystarczająca ilość surowców.');
    }

    userResources.wood -= cost.wood || 0;
    userResources.clay -= cost.clay || 0;
    userResources.iron -= cost.iron || 0;

    await repo.save(userResources);
  }

  async hasEnoughResources(
    userId: number,
    serverId: number,
    cost: ResourceCost,
  ): Promise<boolean> {
    const userResources = await this.repository.findOne({
      user: { id: userId },
      server: { id: serverId },
    } as any);

    if (!userResources) {
      throw new NotFoundException(
        `Nie znaleziono zasobów dla użytkownika o ID: ${userId} na serwerze ${serverId}`,
      );
    }

    const hasWood = userResources.wood >= (cost.wood || 0);
    const hasClay = userResources.clay >= (cost.clay || 0);
    const hasIron = userResources.iron >= (cost.iron || 0);

    return hasWood && hasClay && hasIron;
  }

  async transferResources(
    senderId: number,
    dto: TransferResourcesDto,
  ): Promise<void> {
    const { receiverId, serverId, wood = 0, clay = 0, iron = 0 } = dto;

    if (senderId === receiverId) {
      throw new BadRequestException(
        'Nie możesz wysłać surowców do samego siebie.',
      );
    }

    if (wood === 0 && clay === 0 && iron === 0) {
      throw new BadRequestException(
        'Musisz przesłać przynajmniej jeden surowiec.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const senderResources = await queryRunner.manager.findOne(Resources, {
        where: { user: { id: senderId }, server: { id: serverId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!senderResources) {
        throw new NotFoundException('Nie znaleziono zasobów nadawcy.');
      }

      if (
        senderResources.wood < wood ||
        senderResources.clay < clay ||
        senderResources.iron < iron
      ) {
        throw new BadRequestException('Niewystarczająca ilość surowców.');
      }

      const receiverResources = await queryRunner.manager.findOne(Resources, {
        where: { user: { id: receiverId }, server: { id: serverId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!receiverResources) {
        throw new NotFoundException('Nie znaleziono zasobów odbiorcy.');
      }

      senderResources.wood -= wood;
      senderResources.clay -= clay;
      senderResources.iron -= iron;

      receiverResources.wood += wood;
      receiverResources.clay += clay;
      receiverResources.iron += iron;

      const updatedSender = await queryRunner.manager.save(senderResources);
      const updatedReceiver = await queryRunner.manager.save(receiverResources);

      await queryRunner.commitTransaction();

      this.wsGateway.sendToUser(
        senderId,
        WsEvent.RESOURCE_UPDATE,
        updatedSender,
      );

      this.wsGateway.sendToUser(
        receiverId,
        WsEvent.RESOURCE_UPDATE,
        updatedReceiver,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Wystąpił błąd podczas transferu surowców.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
