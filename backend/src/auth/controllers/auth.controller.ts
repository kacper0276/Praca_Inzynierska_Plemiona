import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Authenticated } from '@core/decorators/authenticated.decorator';
import { Message } from '@core/decorators/message.decorator';
import { Public } from '@core/decorators/public.decorator';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Message('auth.successfully-logged-in')
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
      throw new BadRequestException('invalid-credentials');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @Message('auth.successfully-registered')
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Zwraca utworzonego użytkownika (bez hasła).',
  })
  @ApiBadRequestResponse({
    description: 'Błędne dane rejestracyjne lub hasła nie są zgodne.',
  })
  async register(@Body() body: RegisterDto) {
    if (body.repeatedPassword !== body.password) {
      throw new BadRequestException('passwords-do-not-match');
    }

    const user = await this.authService.register(body);
    const { password, ...rest } = user;
    return rest;
  }

  @Public()
  @Post('refresh')
  @ApiOkResponse({ description: 'Zwraca nowy token dostępowy.' })
  @ApiUnauthorizedResponse({
    description: 'Brak lub nieprawidłowy token odświeżający.',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() body: RefreshTokenDto) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return this.authService.refreshToken(body.refreshToken);
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

  @Public()
  @Post('forgot-password')
  @Message('auth.forgot-password-email-sent')
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    description: 'Jeśli użytkownik istnieje, e-mail został wysłany.',
  })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @Message('auth.password-reset-success')
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Hasło zostało pomyślnie zmienione.' })
  @ApiBadRequestResponse({
    description: 'Token wygasł, jest nieprawidłowy lub hasła się nie zgadzają.',
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    if (body.repeatedPassword !== body.password) {
      throw new BadRequestException('passwords-do-not-match');
    }

    await this.authService.resetPassword(body.token, body.password);
  }

  @Get('profile')
  @Authenticated()
  @Message('received-user-profile-data')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Zwraca dane profilu zalogowanego użytkownika.',
  })
  @ApiUnauthorizedResponse({ description: 'Brak lub nieprawidłowy token.' })
  async getProfile(@CurrentUser() user: any) {
    const userId = user.sub;
    return this.authService.getProfile(userId);
  }
}
