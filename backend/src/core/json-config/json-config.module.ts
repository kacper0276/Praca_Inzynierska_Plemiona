import { DynamicModule, Module } from '@nestjs/common';
import {
  createJsonConfigProvider,
  JsonConfigProviderOptions,
} from './json-config.provider';

@Module({})
export class JsonConfigModule {
  static register(options: JsonConfigProviderOptions): DynamicModule {
    const jsonConfigProvider = createJsonConfigProvider(options);

    return {
      module: JsonConfigModule,
      providers: [jsonConfigProvider],
      exports: [jsonConfigProvider],
      global: true,
    };
  }
}
