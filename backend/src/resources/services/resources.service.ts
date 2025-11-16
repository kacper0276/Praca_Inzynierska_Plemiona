import { Injectable, NotFoundException } from '@nestjs/common';
import { Resources } from '../entities/resources.entity';
import { ResourcesRepository } from '../repositories/resources.repository';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { EntityManager } from 'typeorm';
import { ResourceCost } from 'src/core/consts/building-costs';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly repository: ResourcesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  findAll() {
    return this.repository.findAll({ relations: ['user'] });
  }

  async findOne(id: number) {
    const resource = await this.repository.findOne(
      { id },
      { relations: ['user'] },
    );
    if (!resource) {
      throw new NotFoundException(`Zasób o ID ${id} nie został znaleziony.`);
    }
    return resource;
  }

  async findOrCreateByUserEmail(email: string): Promise<Resources> {
    const user = await this.usersRepository.findOne(
      { email },
      { relations: ['resources'] },
    );

    if (!user) {
      throw new NotFoundException(
        `Użytkownik o emailu ${email} nie został znaleziony.`,
      );
    }

    if (user.resources) {
      return user.resources;
    }

    const newResource = this.repository.create({
      user: user,
      wood: 0,
      clay: 0,
      iron: 0,
      population: 0,
      maxPopulation: 10,
    });

    return this.repository.save(newResource);
  }

  async create(data: CreateResourceDto): Promise<Resources> {
    const { userId, ...resourceData } = data;
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new NotFoundException(
        `Użytkownik o ID ${userId} nie został znaleziony.`,
      );
    }

    const resource = this.repository.create({
      ...resourceData,
      user: user,
    });

    return this.repository.save(resource);
  }

  async update(id: number, data: UpdateResourceDto) {
    await this.findOne(id);
    return this.repository.update(id, data);
  }

  async updateResources(
    userId: number,
    resourcesToAdd: {
      wood: number;
      clay: number;
      iron: number;
    },
  ) {
    const userResources = await this.repository.findOneByUserId(userId);

    if (!userResources) {
      console.error(`Nie znaleziono zasobów dla użytkownika o ID: ${userId}`);
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
    cost: Partial<Resources>,
    transactionalManager?: EntityManager,
  ): Promise<void> {
    const repo = transactionalManager
      ? transactionalManager.getRepository(Resources)
      : this.repository;

    const userResources = await repo.findOne({
      where: { user: { id: userId } },
    });
    if (!userResources) {
      throw new Error('Nie znaleziono zasobów użytkownika.');
    }

    userResources.wood -= cost.wood || 0;
    userResources.clay -= cost.clay || 0;
    userResources.iron -= cost.iron || 0;

    await repo.save(userResources);
  }

  async hasEnoughResources(
    userId: number,
    cost: ResourceCost,
  ): Promise<boolean> {
    const userResources = await this.repository.findOneByUserId(userId);
    if (!userResources) {
      throw new NotFoundException(
        `Nie znaleziono zasobów dla użytkownika o ID: ${userId}`,
      );
    }

    const hasWood = userResources.wood >= (cost.wood || 0);
    const hasClay = userResources.clay >= (cost.clay || 0);
    const hasIron = userResources.iron >= (cost.iron || 0);

    return hasWood && hasClay && hasIron;
  }
}
