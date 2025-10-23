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
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from '../services/resources.service';
import { UserRole } from 'src/core/enums/user-role.enum';
import { Roles } from 'src/core/decorators/roles.decorator';
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
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@ApiTags('Resources')
@ApiBearerAuth('access-token')
@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Zwraca listę surowców dla wszystkich użytkowników.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOkResponse({ description: 'Zwraca szczegóły surowców o podanym ID.' })
  @ApiNotFoundResponse({
    description: 'Surowce o podanym ID nie zostały znalezione.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ description: 'Surowce zostały pomyślnie utworzone.' })
  @ApiBadRequestResponse({ description: 'Przesłane dane są nieprawidłowe.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Surowce zostały pomyślnie zaktualizowane.' })
  @ApiNotFoundResponse({
    description: 'Surowce o podanym ID nie zostały znalezione.',
  })
  @ApiBadRequestResponse({ description: 'Przesłane dane są nieprawidłowe.' })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Surowce zostały pomyślnie usunięte.' })
  @ApiNotFoundResponse({
    description: 'Surowce o podanym ID nie zostały znalezione.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak autoryzacji (niezalogowany).' })
  @ApiForbiddenResponse({
    description: 'Brak uprawnień (rola inna niż admin).',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.remove(id);
  }
}
