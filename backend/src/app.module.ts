import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './core/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './core/config/typeorm/typeorm.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfigAsync } from './core/config/mailer/mailer.config';
import { AuthModule } from './auth/auth.module';
import { ResourcesModule } from './resources/resources.module';
import { LoggerModule } from './core/logger/logger.module';
import { ClansModule } from './clans/clans.module';
import { VillagesModule } from './villages/villages.module';
import { ReportsModule } from './reports/reports.module';
import { WsGateway } from './core/gateways/ws.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { TtlModule } from './ttl/ttl.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    MailerModule.forRootAsync(mailerConfigAsync),
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
  ],
  controllers: [],
  providers: [WsGateway],
})
export class AppModule {}
