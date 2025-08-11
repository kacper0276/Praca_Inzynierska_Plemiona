import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { Resources } from '../entities/resources.entity';
import { ResourcesService } from '../services/resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.resourcesService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Resources>) {
    return this.resourcesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: Partial<Resources>) {
    return this.resourcesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.resourcesService.remove(id);
  }
}
