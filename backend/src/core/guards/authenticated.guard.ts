import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_AUTHENTICATED_KEY } from '../decorators/authenticated.decorator';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAuthenticated = this.reflector.getAllAndOverride<boolean>(
      IS_AUTHENTICATED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isAuthenticated) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return !!(user && user.role);
  }
}
