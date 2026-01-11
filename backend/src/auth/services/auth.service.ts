import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { getActivationEmailTemplate } from 'src/users/templates/activation-email.template';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { TtlService } from '@core/ttl/services/ttl.service';
import { getResetPasswordEmailTemplate } from 'src/users/templates/reset-password-email.template';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly ttlService: TtlService,
  ) {}

  private async sendActivationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    // const activationLink = `http://localhost:4200/activate-account`;
    const activationLink = `http://72.60.18.198/activate-account`;
    const emailTemplate = getActivationEmailTemplate(activationLink, code);

    const message = {
      to: email,
      from: `"Administracja serwisu" <mailtestowy1221@op.pl>`,
      subject: 'Potwierdzenie utworzenia konta',
      html: emailTemplate,
    };

    await this.mailerService.sendMail(message);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    const { passwordHash, ...result } = user as any;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      login: user.login,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    const { password, ...userData } = user;

    return {
      user: userData,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersRepository.findOneById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        login: user.login,
        role: user.role,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async register(data: RegisterDto) {
    const existing = await this.usersRepository.findOneByEmail(data.email);
    if (existing) {
      throw new BadRequestException('auth.register.EMAIL_EXISTS');
    }

    const existingLogin = await this.usersRepository.findOne({
      login: data.login,
    });
    if (existingLogin) {
      throw new BadRequestException('auth.register.LOGIN_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      email: data.email,
      login: data.login,
      password: passwordHash,
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
    });

    const savedUser = await this.usersRepository.save(user);

    const activationCode = await this.ttlService.generateActivationCode(
      savedUser.id,
    );

    await this.sendActivationEmail(savedUser.email, activationCode);

    return savedUser;
  }

  async activateAccount(code: string): Promise<User> {
    const userId = await this.ttlService.verifyActivationCode(code);
    if (!userId) {
      throw new BadRequestException('Invalid or expired activation code');
    }

    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.isActive = true;
    user.deleteAt = null;
    return this.usersRepository.save(user);
  }

  async getProfile(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  private async sendResetPasswordEmail(
    email: string,
    token: string,
    userName: string,
  ): Promise<void> {
    // const resetLink = `http://72.60.18.198/reset-password?token=${token}&email=${email}`;
    const resetLink = `http://localhost:4200/reset-password?token=${token}&email=${email}`;

    const emailTemplate = getResetPasswordEmailTemplate(resetLink, userName);

    const message = {
      to: email,
      from: `"Administracja serwisu" <mailtestowy1221@op.pl>`,
      subject: 'Resetowanie hasła - Serwis',
      html: emailTemplate,
    };

    await this.mailerService.sendMail(message);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOneByEmail(email);

    if (!user) return;

    const token = await this.ttlService.generateResetToken(user.id);

    await this.sendResetPasswordEmail(user.email, token, user.login);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await this.ttlService.verifyResetToken(token);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersRepository.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await this.usersRepository.save(user);

    await this.ttlService.deleteResetToken(token);
  }
}
