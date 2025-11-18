import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/core/decorators/roles.decorator';
import { UserRole } from 'src/core/enums/user-role.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Authenticated } from 'src/core/decorators/authenticated.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ description: 'Użytkownik pomyślnie utworzony.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  @ApiConflictResponse({ description: 'Email lub login już istnieje.' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ description: 'Lista wszystkich użytkowników.' })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(({ password, ...rest }) => rest);
  }

  @Get('by-email/:email')
  @Authenticated()
  @ApiOkResponse({ description: 'Dane użytkownika.' })
  @ApiNotFoundResponse({
    description: 'Użytkownik o podanym adresie email nie został znaleziony.',
  })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findOneByEmail(email);
    const { password, ...result } = user;
    return result;
  }

  @Get(':id')
  @Authenticated()
  @ApiOkResponse({ description: 'Dane użytkownika.' })
  @ApiNotFoundResponse({ description: 'Użytkownik nie znaleziony.' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== id) {
      throw new ForbiddenException(
        'Nie masz uprawnień do przeglądania tego profilu.',
      );
    }
    const user = await this.usersService.findOne(id);
    const { password, ...result } = user;
    return result;
  }

  @Patch(':id')
  @Authenticated()
  @ApiOkResponse({ description: 'Użytkownik pomyślnie zaktualizowany.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const userMakingRequest = req.user;

    if (
      userMakingRequest.role !== UserRole.ADMIN &&
      userMakingRequest.id !== id
    ) {
      throw new ForbiddenException(
        'Nie masz uprawnień do edycji tego profilu.',
      );
    }

    if (userMakingRequest.role !== UserRole.ADMIN && updateUserDto.role) {
      throw new ForbiddenException('Nie możesz zmienić swojej roli.');
    }

    const updatedUser = await this.usersService.update(id, updateUserDto);
    const { password, ...result } = updatedUser;
    return result;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Użytkownik pomyślnie usunięty.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  @ApiNotFoundResponse({ description: 'Użytkownik nie znaleziony.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
