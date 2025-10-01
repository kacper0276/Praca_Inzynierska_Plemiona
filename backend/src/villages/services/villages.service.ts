import { Injectable, NotFoundException } from '@nestjs/common';
import { VillagesRepository } from '../repositories/villages.repository';
import { Village } from '../entities/village.entity';

@Injectable()
export class VillagesService {
  constructor(private readonly villagesRepository: VillagesRepository) {}

  async getByUserId(userId: number): Promise<Village | null> {
    const village = await this.villagesRepository.findOne(
      { user: { id: userId } } as any,
      { relations: ['user'] },
    );
    return village;
  }

  async createForUser(
    userId: number,
    payload: Partial<Village>,
  ): Promise<Village> {
    const entity = this.villagesRepository.create({
      ...payload,
      user: { id: userId } as any,
    });
    return this.villagesRepository.save(entity as Village);
  }

  async updateVillage(id: number, payload: Partial<Village>): Promise<Village> {
    const existing = await this.villagesRepository.findOneById(id);
    if (!existing) throw new NotFoundException('Village not found');
    return this.villagesRepository.update(existing.id, payload);
  }

  async deleteVillage(id: number): Promise<void> {
    await this.villagesRepository.delete(id);
  }
}
