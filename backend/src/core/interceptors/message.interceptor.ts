import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { MESSAGE_KEY } from '../decorators/message.decorator';
import { Response } from '../interfaces/response.interface';

@Injectable()
export class MessageInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const message =
      this.reflector.get<string>(MESSAGE_KEY, context.getHandler()) ?? '';

    return next.handle().pipe(
      map((data) => ({
        message,
        data,
      })),
    );
  }
}
