import { Injectable, NotFoundException } from '@nestjs/common';
import { Resources } from '../entities/resources.entity';
import { ResourcesRepository } from '../repositories/resources.repository';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { UsersRepository } from 'src/users/repositories/users.repository';

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
      maxPopulation: 0,
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

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
