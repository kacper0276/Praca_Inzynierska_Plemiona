import { MailerOptions } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DATABASE_CONFIG_TOKEN,
  MAILER_CONFIG_TOKEN,
  MIGRATION_CONFIG_TOKEN,
} from '../consts/injection-tokens';
import { DatabaseConfig } from '../json-config/interfaces/database-config.interface';
import { MailerConfig } from '../json-config/interfaces/mailer-config.interface';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MigrationConfig } from '../json-config/interfaces/migration-config.interface';

@Injectable()
export class ConfigService {
  constructor(
    @Inject(DATABASE_CONFIG_TOKEN)
    private readonly dbConfig: DatabaseConfig,
    @Inject(MAILER_CONFIG_TOKEN)
    private readonly mailerConfig: MailerConfig,
    @Inject(MIGRATION_CONFIG_TOKEN)
    private readonly migrationConfig: MigrationConfig,
  ) {}

  getDatabaseConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      username: this.dbConfig.username,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
      synchronize: this.dbConfig.synchronize,
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    };
  }

  getMigrationsConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.migrationConfig.host,
      port: this.migrationConfig.port,
      username: this.migrationConfig.username,
      password: this.migrationConfig.password,
      database: this.migrationConfig.database,
      synchronize: this.migrationConfig.synchronize,
      migrations: ['src/core/database/migrations/*{.ts,.js}'],
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    };
  }

  public getMailerConfig(): MailerOptions {
    return {
      transport: {
        host: this.mailerConfig.host,
        port: this.mailerConfig.port,
        secure: this.mailerConfig.secure,
        auth: this.mailerConfig.auth,
      },
      defaults: this.mailerConfig.defaults,
      template: {
        dir: __dirname + '/../../templates/mails',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
