import {
  Body,
  Controller,
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
import { RecruitUnitDto } from '../dto/recruit-unit.dto';
import { UpgradeUnitDto } from '../dto/upgrade-unit.dto';
import { CurrentUser } from '@core/decorators/current-user.decorator';

@ApiTags('Army')
@ApiBearerAuth('access-token')
@Controller('army')
export class ArmyController {
  constructor(private readonly armyService: ArmyService) {}

  @Get(':serverId')
  @Authenticated()
  @ApiOkResponse({ description: 'Zwraca stan armii w danej wiosce.' })
  @ApiNotFoundResponse({ description: 'Wioska nie znaleziona.' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień do podglądu tej wioski.',
  })
  async getArmy(
    @Param('serverId', ParseIntPipe) serverId: number,
    @CurrentUser() user: any,
  ) {
    return this.armyService.getArmyByServerAndUser(serverId, user.sub);
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
    return this.armyService.recruitUnits(user.sub, dto);
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
    return this.armyService.upgradeUnit(user.sub, dto);
  }
}
