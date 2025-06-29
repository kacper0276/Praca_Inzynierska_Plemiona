import { MailerOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get(key: string): string {
    return this.configService.getOrThrow<string>(key, {
      infer: true,
    });
  }

  getDatabaseConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.get('DB_HOST'),
      port: parseInt(this.get('DB_PORT'), 10),
      username: this.get('DB_USER'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_NAME'),
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }

  getMailerConfig(): MailerOptions {
    return {
      transport: {
        host: this.get('MAIL_HOST'),
        port: parseInt(this.get('MAIL_PORT'), 10),
        secure: this.get('MAIL_SECURE') === 'true',
        auth: {
          user: this.get('MAIL_USER'),
          pass: this.get('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `"No Reply" <${this.get('MAIL_FROM')}>`,
      },
      template: {
        dir: __dirname + '/../../templates/mails',
        adapter:
          new (require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter').HandlebarsAdapter)(),
        options: {
          strict: true,
        },
      },
    };
  }
}
