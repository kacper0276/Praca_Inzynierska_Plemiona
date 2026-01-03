import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Request,
} from '@nestjs/common';
import { ClansService } from '../services/clans.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '@core/decorators/roles.decorator';
import { UserRole } from '@core/enums/user-role.enum';
import { CreateClanDto } from '../dto/create-clan.dto';
import { Public } from '@core/decorators/public.decorator';
import { UpdateClanDto } from '../dto/update-clan.dto';
import { Message } from '@core/decorators/message.decorator';
import { Authenticated } from '@core/decorators/authenticated.decorator';

@ApiTags('Clans')
@ApiBearerAuth('access-token')
@Controller('clans')
export class ClansController {
  constructor(private readonly clansService: ClansService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Message('Utworzono klan')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Klan został pomyślnie utworzony.' })
  @ApiBadRequestResponse({ description: 'Przesłane dane są nieprawidłowe.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  create(@Body() createClanDto: CreateClanDto) {
    return this.clansService.create(createClanDto);
  }

  @Public()
  @Get()
  @ApiOkResponse({ description: 'Zwraca listę wszystkich klanów.' })
  findAll() {
    return this.clansService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: 'Zwraca szczegóły wybranego klanu.' })
  @ApiBadRequestResponse({
    description: 'Identyfikator klanu jest nieprawidłowy.',
  })
  @ApiNotFoundResponse({
    description: 'Klan o podanym ID nie został znaleziony.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clansService.findOne(id);
  }

  @Get('get-user-clan-for-server/:serverId')
  @Authenticated()
  @ApiOkResponse({ description: 'Zwraca klan użytkownika dla danego serwera' })
  @ApiBadRequestResponse({
    description: 'Nie znaleziono klanu',
  })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  async findUserClanForServer(
    @Param('serverId', ParseIntPipe) serverId: number,
    @Request() req: any,
  ) {
    const userId = +req.user.sub;
    return this.clansService.findUserClanForServer(userId, serverId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Klan został pomyślnie zaktualizowany.' })
  @ApiBadRequestResponse({
    description: 'Przesłane dane lub identyfikator są nieprawidłowe.',
  })
  @ApiNotFoundResponse({
    description: 'Klan o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClanDto: UpdateClanDto,
  ) {
    return this.clansService.update(id, updateClanDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Klan został pomyślnie usunięty.' })
  @ApiNotFoundResponse({
    description: 'Klan o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clansService.remove(id);
  }
}
