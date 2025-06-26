import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersGateway } from './users.gateway';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersGateway]
})
export class UsersModule {}
