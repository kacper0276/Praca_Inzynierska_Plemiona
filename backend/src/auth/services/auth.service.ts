import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/repositories/users.repository';
import { getActivationEmailTemplate } from 'src/users/templates/activation-email.template';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  private async sendActivationEmail(email: string): Promise<void> {
    const activationLink = `http://localhost:4200/auth/activate-account/${email}`;
    const emailTemplate = getActivationEmailTemplate(activationLink);

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
    const payload = { sub: user.id, email: user.email, role: user.role };

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
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(user: any) {
    const payload = {
      sub: user.sub,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    return {
      access_token: newAccessToken,
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const existing = await this.usersRepository.findOneByEmail(data.email);
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      email: data.email,
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await this.sendActivationEmail(data.email);

    return this.usersRepository.save(user);
  }
}
