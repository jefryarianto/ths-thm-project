import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { RedisThrottlerStorageService } from './redis-throttler-storage.service.js';
import { RedisService } from './redis.service.js';
import { createRedisMock } from '../test/mocks/redis.mock.js';

describe('RedisThrottlerStorageService', () => {
  let service: RedisThrottlerStorageService;
  let redis: jest.Mocked<RedisService>;

  beforeEach(async () => {
    redis = createRedisMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisThrottlerStorageService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<RedisThrottlerStorageService>(RedisThrottlerStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  Normal flow — Redis is available
  // ──────────────────────────────────────────────

  describe('normal operation (Redis available)', () => {
    it('should increment counter and return totalHits', async () => {
      redis.eval.mockResolvedValue([1, 60000, 0, 0]);

      const result = await service.increment('test-key', 60000, 10, 0, 'default');

      expect(redis.eval).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        totalHits: 1,
        timeToExpire: 60000,
        isBlocked: false,
        timeToBlockExpire: 0,
      });
    });

    it('should return isBlocked=true when blocked by Lua script', async () => {
      redis.eval.mockResolvedValue([0, 0, 1, 30000]);

      const result = await service.increment('blocked-key', 60000, 5, 120000, 'default');

      expect(result).toEqual({
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: true,
        timeToBlockExpire: 30000,
      });
    });

    it('should handle zero timeToExpire from Redis PTTL', async () => {
      redis.eval.mockResolvedValue([5, -1, 0, 0]);

      const result = await service.increment('no-ttl-key', 60000, 10, 0, 'default');

      expect(result.timeToExpire).toBe(0);
    });

    it('should use throttlerName in Redis key prefix', async () => {
      redis.eval.mockResolvedValue([1, 60000, 0, 0]);

      await service.increment('user:ip-123', 60000, 10, 0, 'login');

      expect(redis.eval).toHaveBeenCalledWith(
        expect.any(String),
        1,
        'throttler:login:user:ip-123',
        '60000',
        '10',
        '0',
      );
    });
  });

  // ──────────────────────────────────────────────
  //  Redis down — graceful degradation
  // ──────────────────────────────────────────────

  describe('Redis unavailable (graceful degradation)', () => {
    it('should fail-open when Redis throws an error', async () => {
      redis.eval.mockRejectedValue(new Error('ECONNREFUSED connect ::1:6379'));

      const result = await service.increment('any-key', 60000, 10, 0, 'default');

      expect(result).toEqual({
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      });
    });

    it('should log warning only on first Redis failure', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      redis.eval.mockRejectedValue(new Error('Connection refused'));

      // First call — should log warning
      await service.increment('key-1', 60000, 10, 0, 'default');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redis unavailable'),
      );

      // Second call — should NOT log again (redisDown flag)
      await service.increment('key-2', 60000, 10, 0, 'default');
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
      logSpy.mockRestore();
    });

    it('should handle non-Error thrown value (e.g. string)', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      redis.eval.mockRejectedValue('REDIS_TIMEOUT');

      const result = await service.increment('any-key', 60000, 10, 0, 'default');

      // Should still fail-open
      expect(result).toEqual({
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      });
      // Should use 'Unknown error' for non-Error throws
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error'),
      );

      warnSpy.mockRestore();
    });
  });

  // ──────────────────────────────────────────────
  //  Recovery scenario
  // ──────────────────────────────────────────────

  describe('Redis recovery', () => {
    it('should log recovery message when Redis comes back', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      // First call — Redis down
      redis.eval.mockRejectedValue(new Error('Connection refused'));
      await service.increment('key', 60000, 10, 0, 'default');

      // Second call — Redis recovered
      redis.eval.mockResolvedValue([3, 30000, 0, 0]);
      const result = await service.increment('key', 60000, 10, 0, 'default');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redis connection restored'),
      );
      expect(result).toEqual({
        totalHits: 3,
        timeToExpire: 30000,
        isBlocked: false,
        timeToBlockExpire: 0,
      });

      logSpy.mockRestore();
    });
  });
});
