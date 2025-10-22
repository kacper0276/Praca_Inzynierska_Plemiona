import { Module } from '@nestjs/common';
import { TtlService } from './services/ttl.service';

@Module({
  providers: [TtlService],
  exports: [TtlService],
})
export class TtlModule {}
