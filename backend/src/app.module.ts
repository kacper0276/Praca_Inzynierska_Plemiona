import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './core/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './core/config/typeorm/typeorm.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfigAsync } from './core/config/mailer/mailer.config';
import { AuthModule } from './auth/auth.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    MailerModule.forRootAsync(mailerConfigAsync),
    AuthModule,
    ResourcesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
