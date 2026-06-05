import { RedisService } from '../../redis/redis.service.js';

/**
 * Create a mock RedisService.
 * RedisService extends `ioredis` which has get/set/del methods.
 */
export function createRedisMock(): jest.Mocked<RedisService> {
  return {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    eval: jest.fn(),
    isConnected: jest.fn(),
    quit: jest.fn(),
    onModuleDestroy: jest.fn(),
  } as unknown as jest.Mocked<RedisService>;
}
