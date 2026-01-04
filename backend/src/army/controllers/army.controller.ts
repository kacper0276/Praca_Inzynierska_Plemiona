import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArmyService } from '../services/army.service';
import { Authenticated } from '@core/decorators/authenticated.decorator';
import { UserRole } from '@core/enums/user-role.enum';
import { RecruitUnitDto } from '../dto/recruit-unit.dto';
import { UpgradeUnitDto } from '../dto/upgrade-unit.dto';
import { CurrentUser } from '@core/decorators/current-user.decorator';

@ApiTags('Army')
@ApiBearerAuth('access-token')
@Controller('army')
export class ArmyController {
  constructor(private readonly armyService: ArmyService) {}

  @Get(':villageId')
  @Authenticated()
  @ApiOkResponse({ description: 'Zwraca stan armii w danej wiosce.' })
  @ApiNotFoundResponse({ description: 'Wioska nie znaleziona.' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do podglądu tej wioski.',
  })
  async getArmy(
    @Param('villageId', ParseIntPipe) villageId: number,
    @CurrentUser() user: any,
  ) {
    if (user.role !== UserRole.ADMIN) {
      const isOwner = await this.armyService.checkVillageOwnership(
        user.sub,
        villageId,
      );
      if (!isOwner) {
        throw new ForbiddenException('Nie masz dostępu do armii w tej wiosce.');
      }
    }

    return this.armyService.getArmyByVillageId(villageId);
  }

  @Post('recruit')
  @Authenticated()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Jednostki zostały pomyślnie zrekrutowane.',
  })
  @ApiBadRequestResponse({
    description: 'Brak surowców lub nieprawidłowe dane.',
  })
  @ApiNotFoundResponse({ description: 'Wioska nie istnieje.' })
  @ApiForbiddenResponse({
    description: 'Możesz rekrutować tylko we własnej wiosce.',
  })
  async recruitUnit(@Body() dto: RecruitUnitDto, @CurrentUser() user: any) {
    if (user.role !== UserRole.ADMIN) {
      const isOwner = await this.armyService.checkVillageOwnership(
        user.sub,
        dto.villageId,
      );
      if (!isOwner) {
        throw new ForbiddenException(
          'Możesz rekrutować tylko we własnej wiosce.',
        );
      }
    }

    return this.armyService.recruitUnits(dto);
  }

  @Post('upgrade')
  @Authenticated()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Poziom jednostki został zwiększony.' })
  @ApiBadRequestResponse({
    description: 'Brak surowców lub nieprawidłowe dane.',
  })
  @ApiNotFoundResponse({
    description: 'Wioska lub typ jednostki nie istnieje.',
  })
  @ApiForbiddenResponse({
    description: 'Możesz ulepszać tylko we własnej wiosce.',
  })
  async upgradeUnit(@Body() dto: UpgradeUnitDto, @CurrentUser() user: any) {
    if (user.role !== UserRole.ADMIN) {
      const isOwner = await this.armyService.checkVillageOwnership(
        user.sub,
        dto.villageId,
      );
      if (!isOwner) {
        throw new ForbiddenException(
          'Możesz ulepszać jednostki tylko we własnej wiosce.',
        );
      }
    }

    return this.armyService.upgradeUnit(dto);
  }
}
