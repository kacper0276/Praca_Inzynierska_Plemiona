import * as fs from 'fs';
import * as path from 'path';
import * as Joi from 'joi';
import { Provider } from '@nestjs/common';

export interface JsonConfigProviderOptions {
  fileName: string;
  validationSchema: Joi.ObjectSchema;
  providerToken: string;
}

export function createJsonConfigProvider(
  options: JsonConfigProviderOptions,
): Provider {
  return {
    provide: options.providerToken,
    useFactory: () => {
      const filePath = path.join(
        process.cwd(),
        'config',
        `${options.fileName}.json`,
      );

      if (!fs.existsSync(filePath)) {
        throw new Error(
          `Plik konfiguracyjny ${filePath} nie został znaleziony.`,
        );
      }

      const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const { error, value } = options.validationSchema.validate(config);

      if (error) {
        throw new Error(
          `Błąd walidacji konfiguracji w pliku ${options.fileName}.json: ${error.message}`,
        );
      }

      return value;
    },
  };
}
