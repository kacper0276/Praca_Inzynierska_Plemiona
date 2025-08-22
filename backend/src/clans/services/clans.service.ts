import { Injectable } from '@nestjs/common';
import { Clan } from '../entities/clan.entity';
import { ClansRepository } from '../repositories/clans.repository';

@Injectable()
export class ClansService {
  constructor(private readonly clansRepository: ClansRepository) {}

  findAll(): Promise<Clan[]> {
    return this.clansRepository.findAll({ relations: ['members'] });
  }

  findOne(id: number): Promise<Clan | null> {
    return this.clansRepository.findOne({ id }, { relations: ['members'] });
  }

  create(clan: Partial<Clan>): Promise<Clan> {
    const newClan = this.clansRepository.create(clan);
    return this.clansRepository.save(newClan);
  }

  async update(id: number, clan: Partial<Clan>): Promise<Clan> {
    await this.clansRepository.update(id, clan);
    return this.findOne(id) as Promise<Clan>;
  }

  async remove(id: number): Promise<void> {
    await this.clansRepository.delete(id);
  }
}
