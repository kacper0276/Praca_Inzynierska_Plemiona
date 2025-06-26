import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as bodyParser from 'body-parser';
import { ConfigService } from './core/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'), 10);

  const config = new DocumentBuilder()
    .setTitle('Pracownia Dyplomowa - Swagger')
    .setDescription('Swagger przygotowany dla testowania API')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory(), {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({
    origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  app.use(cookieParser());

  app.use(bodyParser.json({ limit: '10mb' }));

  await app.listen(port);
}
bootstrap();
