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

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    MailerModule.forRootAsync(mailerConfigAsync),
    AuthModule,
    ResourcesModule,
    LoggerModule,
    ClansModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
