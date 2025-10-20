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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Public } from 'src/core/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    description:
      'Zwraca token JWT w polu access_token, refresh token i dane użytkownika',
  })
  @ApiUnauthorizedResponse({ description: 'Nieprawidłowe dane logowania' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { statusCode: 401, message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Post('register')
  @ApiCreatedResponse({
    description: 'Zwraca utworzonego użytkownika (bez hasła)',
  })
  @ApiBadRequestResponse({ description: 'Błędne dane rejestracyjne' })
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
  refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user);
  }
}
