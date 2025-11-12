import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ConfigService } from '../config/config.service';

const getDataSource = async (): Promise<DataSource> => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });

  const configService = app.get(ConfigService);
  const options = configService.getMigrationsConfig();

  await app.close();

  return new DataSource(options as DataSourceOptions);
};

export default getDataSource();
