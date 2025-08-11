import { Injectable } from '@nestjs/common';
import { Resources } from '../entities/resources.entity';
import { ResourcesRepository } from '../repositories/resources.repository';

@Injectable()
export class ResourcesService {
  constructor(private readonly repository: ResourcesRepository) {}

  findAll() {
    return this.repository.findAll({ relations: ['user'] });
  }

  findOne(id: number) {
    return this.repository.findOne(
      {
        id,
      },
      { relations: ['user'] },
    );
  }

  create(data: Partial<Resources>) {
    const resources = this.repository.create(data);
    return resources;
  }

  update(id: number, data: Partial<Resources>) {
    return this.repository.update(id, data);
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
