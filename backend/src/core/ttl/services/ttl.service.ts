import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class TtlService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async generateActivationCode(userId: number): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await this.cacheManager.set(`activation-${code}`, userId, 300000);
    return code;
  }

  async verifyActivationCode(code: string): Promise<number | null> {
    const userId = await this.cacheManager.get<number | string>(
      `activation-${code}`,
    );
    if (userId !== undefined && userId !== null) {
      await this.cacheManager.del(`activation-${code}`);
      return typeof userId === 'string' ? parseInt(userId, 10) : userId;
    }
    return null;
  }
}
