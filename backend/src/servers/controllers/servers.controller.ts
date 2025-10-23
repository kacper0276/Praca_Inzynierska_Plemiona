import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/core/decorators/roles.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UserRole } from 'src/core/enums/user-role.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/core/decorators/public.decorator';
import { ServersService } from '../services/servers.service';
import { CreateServerDto } from '../dto/create-server.dto';
import { UpdateServerDto } from '../dto/update-server.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@ApiTags('Servers')
@ApiBearerAuth('access-token')
@Controller('servers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServerController {
  constructor(private readonly serverService: ServersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Serwer został pomyślnie utworzony.' })
  @ApiBadRequestResponse({ description: 'Przesłane dane są nieprawidłowe.' })
  @ApiUnauthorizedResponse({
    description: 'Brak autoryzacji lub niewystarczające uprawnienia.',
  })
  create(@Body() createServerDto: CreateServerDto) {
    return this.serverService.create(createServerDto);
  }

  @Get()
  @Public()
  @ApiOkResponse({ description: 'Zwraca listę wszystkich serwerów.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji.' })
  findAll() {
    return this.serverService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOkResponse({ description: 'Zwraca szczegóły wybranego serwera.' })
  @ApiBadRequestResponse({
    description: 'Identyfikator serwera jest nieprawidłowy.',
  })
  @ApiNotFoundResponse({
    description: 'Serwer o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Serwer został pomyślnie zaktualizowany.' })
  @ApiBadRequestResponse({
    description: 'Przesłane dane lub identyfikator są nieprawidłowe.',
  })
  @ApiNotFoundResponse({
    description: 'Serwer o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({
    description: 'Brak autoryzacji lub niewystarczające uprawnienia.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServerDto: UpdateServerDto,
  ) {
    return this.serverService.update(id, updateServerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Serwer został pomyślnie usunięty.' })
  @ApiNotFoundResponse({
    description: 'Serwer o podanym ID nie został znaleziony.',
  })
  @ApiUnauthorizedResponse({
    description: 'Brak autoryzacji lub niewystarczające uprawnienia.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverService.remove(id);
  }
}
