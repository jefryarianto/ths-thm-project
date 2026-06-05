import { Test, TestingModule } from '@nestjs/testing';
import { RedisService, REDIS_OPTIONS } from './redis.service.js';

// ─── Mock ioredis ───
// RedisService now uses composition (new Redis() internally).
// We mock the Redis constructor to return a fake client with all the methods
// that get/set/del/eval/ping/quit delegate to lazy jest.fn() references.

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDel = jest.fn();
const mockEval = jest.fn();
const mockPing = jest.fn();
const mockQuit = jest.fn();

let capturedUrl: string | undefined;

jest.mock('ioredis', () => {
  // Using a factory so we don't eagerly read the mock functions (they'd be in TDZ)
  return jest.fn().mockImplementation(function (url: string) {
    capturedUrl = url;
    this.get = mockGet;
    this.set = mockSet;
    this.del = mockDel;
    this.eval = mockEval;
    this.ping = mockPing;
    this.quit = mockQuit;
  });
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.REDIS_URL;
    capturedUrl = undefined;
  });

  async function createService(options?: { url: string }) {
    const providers: any[] = [RedisService];
    if (options) {
      providers.push({ provide: REDIS_OPTIONS, useValue: options });
    }
    const module: TestingModule = await Test.createTestingModule({
      providers,
    }).compile();
    return module.get<RedisService>(RedisService);
  }

  // ──────────────────────────────────────────────
  //  constructor — URL resolution
  // ──────────────────────────────────────────────

  describe('constructor', () => {
    it('should use provided options.url when REDIS_OPTIONS is injected', async () => {
      service = await createService({ url: 'redis://test:9999' });
      expect(capturedUrl).toBe('redis://test:9999');
    });

    it('should fall back to process.env.REDIS_URL when no options injected', async () => {
      process.env.REDIS_URL = 'redis://env:6379';
      service = await createService();
      expect(capturedUrl).toBe('redis://env:6379');
    });

    it('should use default URL when no options and no env var', async () => {
      service = await createService();
      expect(capturedUrl).toBe('redis://localhost:6379');
    });
  });

  // Create a default service for method tests
  beforeEach(async () => {
    service = await createService();
  });

  // ──────────────────────────────────────────────
  //  Delegated methods — get / set / del / eval
  // ──────────────────────────────────────────────

  describe('get', () => {
    it('should delegate to client.get and return the value', async () => {
      mockGet.mockResolvedValue('stored-value');

      const result = await service.get('my-key');

      expect(mockGet).toHaveBeenCalledWith('my-key');
      expect(result).toBe('stored-value');
    });

    it('should return null when key does not exist', async () => {
      mockGet.mockResolvedValue(null);

      const result = await service.get('missing-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should delegate to client.set with key, value, and TTL args', async () => {
      mockSet.mockResolvedValue('OK');

      const result = await service.set('otp:1', '123456', 'EX', 300);

      expect(mockSet).toHaveBeenCalledWith('otp:1', '123456', 'EX', 300);
      expect(result).toBe('OK');
    });
  });

  describe('del', () => {
    it('should delegate to client.del and return count of deleted keys', async () => {
      mockDel.mockResolvedValue(1);

      const result = await service.del('otp:1');

      expect(mockDel).toHaveBeenCalledWith('otp:1');
      expect(result).toBe(1);
    });
  });

  describe('eval', () => {
    it('should delegate to client.eval with script and args', async () => {
      mockEval.mockResolvedValue([1, 60000, 0, 0]);

      const result = await service.eval('return 1', 1, 'key1', 'arg1');

      expect(mockEval).toHaveBeenCalledWith('return 1', 1, 'key1', 'arg1');
      expect(result).toEqual([1, 60000, 0, 0]);
    });
  });

  // ──────────────────────────────────────────────
  //  isConnected()
  // ──────────────────────────────────────────────

  describe('isConnected', () => {
    it('should return true when ping returns PONG', async () => {
      mockPing.mockResolvedValue('PONG');

      const result = await service.isConnected();

      expect(mockPing).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should return false when ping throws an error', async () => {
      mockPing.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await service.isConnected();

      expect(mockPing).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it('should return false when ping returns unexpected value', async () => {
      mockPing.mockResolvedValue('OK');

      const result = await service.isConnected();

      expect(result).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  //  onModuleDestroy()
  // ──────────────────────────────────────────────

  describe('onModuleDestroy', () => {
    it('should call quit on the Redis client', async () => {
      mockQuit.mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(mockQuit).toHaveBeenCalledTimes(1);
    });
  });
});
