import { Injectable, OnModuleDestroy, Optional, Inject } from '@nestjs/common';
import Redis from 'ioredis';

/** Injection token so we can optionally provide a custom URL for testing */
export const REDIS_OPTIONS = 'REDIS_OPTIONS';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(
    @Optional() @Inject(REDIS_OPTIONS) redisConfig?: { url: string },
  ) {
    this.client = new Redis(redisConfig?.url || process.env.REDIS_URL || 'redis://localhost:6379');
  }

  // ─── Delegated Redis methods (used by consumers) ───

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string | number | Buffer, ...args: any[]): Promise<'OK' | null> {
    return this.client.set(key, value, ...args);
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  async eval(script: string, numKeys: number, ...args: any[]): Promise<unknown> {
    return this.client.eval(script, numKeys, ...args);
  }

  /** Check whether Redis is reachable by sending a PING command. */
  async isConnected(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
