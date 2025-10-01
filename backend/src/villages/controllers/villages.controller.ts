import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { VillagesService } from '../services/villages.service';
import { Village } from '../entities/village.entity';

@Controller('villages')
export class VillagesController {
  constructor(private readonly villagesService: VillagesService) {}

  @Get('by-user/:userId')
  async getByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Village | null> {
    return this.villagesService.getByUserId(userId);
  }

  @Post('for-user/:userId')
  async createForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payload: Partial<Village>,
  ): Promise<Village> {
    return this.villagesService.createForUser(userId, payload);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: Partial<Village>,
  ): Promise<Village> {
    return this.villagesService.updateVillage(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.villagesService.deleteVillage(id);
  }
}
