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
  UseInterceptors,
  UploadedFiles,
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
import { Roles } from '@core/decorators/roles.decorator';
import { UserRole } from '@core/enums/user-role.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Authenticated } from '@core/decorators/authenticated.decorator';
import { AuthService } from 'src/auth/services/auth.service';
import { MulterConfigInterceptor } from '@core/interceptors/multer-config.interceptor';
import { UpdateUserDeletionTimeDto } from '../dto/update-user-deletion-time.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

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

  @Post('friends/invite-by-email/:email')
  @Authenticated()
  @ApiCreatedResponse({
    description: 'Zaproszenie do znajomych zostało wysłane.',
  })
  @ApiNotFoundResponse({
    description: 'Użytkownik o podanym e-mailu nie został znaleziony.',
  })
  @ApiConflictResponse({ description: 'Zaproszenie już istnieje.' })
  async sendFriendRequestByEmail(
    @Param('email') email: string,
    @Request() req: any,
  ) {
    const senderId = req.user.sub;
    return this.usersService.sendFriendRequestByEmail(senderId, email);
  }

  @Post('friends/invite/:receiverId')
  @Authenticated()
  @ApiCreatedResponse({
    description: 'Zaproszenie do znajomych zostało wysłane.',
  })
  @ApiNotFoundResponse({ description: 'Użytkownik nie został znaleziony.' })
  @ApiConflictResponse({ description: 'Zaproszenie już istnieje.' })
  async sendFriendRequest(
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Request() req: any,
  ) {
    const senderId = req.user.sub;
    return this.usersService.sendFriendRequest(senderId, receiverId);
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

  @Get('search/:query')
  @Authenticated()
  @ApiOkResponse({ description: 'Lista użytkowników pasujących do zapytania.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async searchUsers(@Param('query') query: string, @Request() req: any) {
    const currentUserId = req.user.sub;
    const users = await this.usersService.searchUsers(query, currentUserId);
    return users;
  }

  @Get(':id')
  @Authenticated()
  @ApiOkResponse({ description: 'Dane użytkownika.' })
  @ApiNotFoundResponse({ description: 'Użytkownik nie znaleziony.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
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

  @Patch('update-user/:email')
  @Authenticated()
  @ApiOkResponse({ description: 'Użytkownik pomyślnie zaktualizowany.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async update(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const userMakingRequest = req.user;

    if (userMakingRequest.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Nie masz uprawnień do edycji tego profilu.',
      );
    }

    if (userMakingRequest.role !== UserRole.ADMIN && updateUserDto.role) {
      throw new ForbiddenException('Nie możesz zmienić swojej roli.');
    }

    const updatedUser = await this.usersService.update(email, updateUserDto);

    return updatedUser;
  }

  @Patch('update-user-and-login/:email')
  @Authenticated()
  @ApiOkResponse({ description: 'Użytkownik pomyślnie zaktualizowany.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  @UseInterceptors(MulterConfigInterceptor)
  async updateAndLogin(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      backgroundImage?: Express.Multer.File[];
    },
  ) {
    const userMakingRequest = req.user;

    if (
      userMakingRequest.role !== UserRole.ADMIN ||
      userMakingRequest.email !== email
    ) {
      throw new ForbiddenException(
        'Nie masz uprawnień do edycji tego profilu.',
      );
    }

    if (userMakingRequest.role !== UserRole.ADMIN && updateUserDto.role) {
      throw new ForbiddenException('Nie możesz zmienić swojej roli.');
    }

    const updatedUser = await this.usersService.update(
      email,
      updateUserDto,
      files,
    );

    const tokens = await this.authService.login(updatedUser);

    const { password, ...result } = updatedUser;

    return {
      user: result,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Patch(':id/set-deletion-time')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({
    description: 'Data usunięcia użytkownika pomyślnie zaktualizowana.',
  })
  @ApiNotFoundResponse({ description: 'Użytkownik nie znaleziony.' })
  @ApiForbiddenResponse({ description: 'Brak uprawnień.' })
  async setDeletionTime(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDeletionTimeDto,
  ) {
    const user = await this.usersService.setDeletionTime(id, dto);
    const { password, ...result } = user;
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
