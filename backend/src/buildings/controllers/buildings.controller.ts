import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { BuildingsService } from '../services/buildings.service';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { UpdateBuildingDto } from '../dto/update-building.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authenticated } from '@core/decorators/authenticated.decorator';

@ApiTags('Buildings')
@ApiBearerAuth('access-token')
@Controller('buildings')
@Authenticated()
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get('village/:villageId')
  @ApiOkResponse({ description: 'Zwraca listę budynków dla danej wioski.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  findAllForVillage(@Param('villageId', ParseIntPipe) villageId: number) {
    return this.buildingsService.findAllForVillage(villageId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Zwraca szczegóły budynku o podanym ID.' })
  @ApiNotFoundResponse({
    description: 'Budynek o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.buildingsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Budynek został pomyślnie utworzony.' })
  @ApiBadRequestResponse({ description: 'Przesłane dane są nieprawidłowe.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingsService.create(createBuildingDto);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Budynek został pomyślnie zaktualizowany.' })
  @ApiNotFoundResponse({
    description: 'Budynek o podanym ID nie został znaleziony.',
  })
  @ApiBadRequestResponse({ description: 'Przesłane dane są nieprawidłowe.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingsService.update(id, updateBuildingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Budynek został pomyślnie usunięty.' })
  @ApiNotFoundResponse({
    description: 'Budynek o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.buildingsService.remove(id);
  }
}
