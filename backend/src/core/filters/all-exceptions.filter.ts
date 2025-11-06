import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseConnectionError } from '../exceptions/database-connection.error';
import { FileLogger } from '../logger/file-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new FileLogger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;

    if (exception instanceof HttpException) {
      this.logger.warn(
        `[HttpException] Path: ${request.url}, Status: ${status}`,
        exception.stack,
      );
      message = exception.getResponse();
    } else if (exception instanceof DatabaseConnectionError) {
      this.logger.error(
        `[Database Error] Krytyczny błąd bazy danych: ${exception.message}`,
        exception.stack,
      );
      message = {
        message: 'Wystąpił wewnętrzny błąd systemu. Spróbuj ponownie później.',
      };
    } else {
      this.logger.error(
        `[Unknown Exception] Path: ${request.url}`,
        (exception as Error).stack,
      );
      message = { message: 'Wystąpił nieoczekiwany błąd wewnętrzny.' };
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    });
  }
}
