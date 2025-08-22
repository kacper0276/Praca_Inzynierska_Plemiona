import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ClansService } from '../services/clans.service';
import { Clan } from '../entities/clan.entity';

@Controller('clans')
export class ClansController {
  constructor(private readonly clansService: ClansService) {}

  @Get()
  findAll(): Promise<Clan[]> {
    return this.clansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Clan | null> {
    return this.clansService.findOne(Number(id));
  }

  @Post()
  create(@Body() clan: Partial<Clan>): Promise<Clan> {
    return this.clansService.create(clan);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() clan: Partial<Clan>): Promise<Clan> {
    return this.clansService.update(Number(id), clan);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clansService.remove(Number(id));
  }
}
