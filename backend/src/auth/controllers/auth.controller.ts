import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { ActivateAccountDto } from '../dto/activate-account.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      'Zwraca token JWT w polu access_token, refresh token i dane użytkownika.',
  })
  @ApiUnauthorizedResponse({ description: 'Nieprawidłowe dane logowania.' })
  @ApiBadRequestResponse({
    description: 'Błędne dane wejściowe (np. zły format e-maila).',
  })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { statusCode: 401, message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Zwraca utworzonego użytkownika (bez hasła).',
  })
  @ApiBadRequestResponse({
    description: 'Błędne dane rejestracyjne lub hasła nie są zgodne.',
  })
  async register(@Body() body: RegisterDto) {
    if (body.repeated_password !== body.password) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.authService.register(body);
    const { password, ...rest } = user;
    return rest;
  }

  @Public()
  @Get('refresh')
  @ApiOkResponse({ description: 'Zwraca nowy token dostępowy.' })
  @ApiUnauthorizedResponse({
    description: 'Brak lub nieprawidłowy token odświeżający.',
  })
  refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user);
  }

  @Public()
  @Post('activate')
  @ApiBody({ type: ActivateAccountDto })
  @ApiOkResponse({
    description: 'Konto użytkownika zostało pomyślnie aktywowane.',
  })
  @ApiBadRequestResponse({
    description: 'Nieprawidłowy lub wygasły kod aktywacyjny.',
  })
  async activateAccount(@Body() body: ActivateAccountDto) {
    const user = await this.authService.activateAccount(
      body.code.toUpperCase(),
    );
    const { password, ...result } = user;
    return result;
  }
}
