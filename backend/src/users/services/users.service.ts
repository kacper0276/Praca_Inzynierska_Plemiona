import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { getActivationEmailTemplate } from '../templates/activation-email.template';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailerService: MailerService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

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

  async registerUser(data: CreateUserDto): Promise<User> {
    if (data.password !== data.repeatedPassword) {
      throw new BadRequestException('passwords-do-not-match');
    }

    const userExisting = this.usersRepository.findByEmail(data.email);

    if (userExisting) {
      throw new BadRequestException('user-already-exists');
    }

    const hashedPassword = await this.hashPassword(data.password);

    data.password = hashedPassword;

    delete data.repeatedPassword;

    await this.sendActivationEmail(data.email);

    return this.usersRepository.create(data);
  }
}
