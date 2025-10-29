import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './core/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { ResourcesModule } from './resources/resources.module';
import { LoggerModule } from './core/logger/logger.module';
import { ClansModule } from './clans/clans.module';
import { VillagesModule } from './villages/villages.module';
import { ReportsModule } from './reports/reports.module';
import { WsGateway } from './core/gateways/ws.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { TtlModule } from './core/ttl/ttl.module';
import { JobsModule } from './jobs/jobs.module';
import { JsonConfigModule } from './core/json-config/json-config.module';
import {
  DATABASE_CONFIG_TOKEN,
  MAILER_CONFIG_TOKEN,
} from './core/consts/injection-tokens';
import * as Joi from 'joi';
import { ConfigService } from './core/config/config.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { AuthenticatedGuard } from './core/guards/authenticated.guard';
import { ServersModule } from './servers/servers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JsonConfigModule.register({
      fileName: 'database',
      providerToken: DATABASE_CONFIG_TOKEN,
      validationSchema: Joi.object({
        host: Joi.string().required(),
        port: Joi.number().port().required(),
        username: Joi.string().required(),
        password: Joi.string().allow('').required(),
        database: Joi.string().required(),
        synchronize: Joi.boolean().default(false),
      }),
    }),
    JsonConfigModule.register({
      fileName: 'mailer',
      providerToken: MAILER_CONFIG_TOKEN,
      validationSchema: Joi.object({
        host: Joi.string().required(),
        port: Joi.number().port().required(),
        secure: Joi.boolean().required(),
        auth: Joi.object({
          user: Joi.string().required(),
          pass: Joi.string().required(),
        }).required(),
        defaults: Joi.object({
          from: Joi.string().required(),
        }).required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getDatabaseConfig(),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getMailerConfig(),
    }),

    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),

    UsersModule,
    AuthModule,
    ResourcesModule,
    LoggerModule,
    ClansModule,
    VillagesModule,
    ReportsModule,
    TtlModule,
    JobsModule,
    ServersModule,
  ],
  controllers: [],
  providers: [
    WsGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticatedGuard,
    },
  ],
})
export class AppModule {}
