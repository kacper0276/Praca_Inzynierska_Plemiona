import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  ForbiddenException,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VillagesService } from '../services/villages.service';
import { VillageStateDto } from '../dto/village-state.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/core/decorators/roles.decorator';
import { UserRole } from 'src/core/enums/user-role.enum';
import { Authenticated } from 'src/core/decorators/authenticated.decorator';

@ApiTags('Villages')
@ApiBearerAuth('access-token')
@Controller('villages')
export class VillagesController {
  constructor(private readonly villagesService: VillagesService) {}

  @Get('user/:userId')
  @Authenticated()
  @ApiOkResponse({ description: 'Zwraca wioskę użytkownika.' })
  @ApiNotFoundResponse({
    description: 'Nie znaleziono wioski dla danego użytkownika.',
  })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do przeglądania zasobów tego użytkownika.',
  })
  async getByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ) {
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== userId) {
      throw new ForbiddenException('Nie masz uprawnień do tego zasobu.');
    }
    return this.villagesService.getVillageForUser(userId);
  }

  @Patch(':id')
  @Authenticated()
  @ApiOkResponse({ description: 'Wioska została pomyślnie zaktualizowana.' })
  @ApiNotFoundResponse({ description: 'Wioska o podanym ID nie istnieje.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień do edycji tej wioski.' })
  async updateVillage(
    @Param('id', ParseIntPipe) id: number,
    @Body() villageStateDto: VillageStateDto,
    @Request() req: any,
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      const village = await this.villagesService.getByUserId(req.user.sub);
      if (village.id !== id) {
        throw new ForbiddenException('Możesz edytować tylko własną wioskę.');
      }
    }
    return this.villagesService.updateVillage(id, villageStateDto);
  }

  @Post('user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ description: 'Wioska została pomyślnie utworzona.' })
  @ApiBadRequestResponse({ description: 'Dane wejściowe są nieprawidłowe.' })
  @ApiNotFoundResponse({ description: 'Użytkownik o podanym ID nie istnieje.' })
  @ApiConflictResponse({ description: 'Ten użytkownik już posiada wioskę.' })
  async createForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() villageStateDto: VillageStateDto,
  ) {
    return this.villagesService.createForUser(userId, villageStateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Wioska została pomyślnie usunięta.' })
  @ApiNotFoundResponse({ description: 'Wioska o podanym ID nie istnieje.' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do usunięcia tej wioski.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.villagesService.deleteVillage(id);
  }
}
