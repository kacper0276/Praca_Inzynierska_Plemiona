import { ConfigModule } from '../config.module';
import { ConfigService } from '../config.service';
import { MailerOptions } from '@nestjs-modules/mailer';

export const mailerConfigAsync = {
  imports: [ConfigModule.forRoot()],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<MailerOptions> => {
    return configService.getMailerConfig();
  },
};
