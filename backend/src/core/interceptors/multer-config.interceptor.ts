import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@core/config/config.service';

@Injectable()
export class MulterConfigInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const interceptor = new (FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'backgroundImage', maxCount: 1 },
      ],
      this.configService.getMulterConfigOptions(),
    ))();
    return interceptor.intercept(context, next);
  }
}
