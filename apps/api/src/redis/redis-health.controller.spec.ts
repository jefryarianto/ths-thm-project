import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './redis-health.controller.js';
import { RedisService } from './redis.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createRedisMock } from '../test/mocks/redis.mock.js';
import { createPrismaMock } from '../test/mocks/prisma.mock.js';

describe('HealthController', () => {
  let controller: HealthController;
  let redis: ReturnType<typeof createRedisMock>;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    redis = createRedisMock();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: RedisService, useValue: redis },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  //  GET /health (checkAll)
  // ──────────────────────────────────────────────

  describe('checkAll (GET /health)', () => {
    it('should return healthy when both services are up', async () => {
      redis.isConnected.mockResolvedValue(true);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

      const result = await controller.checkAll();

      expect(result.status).toBe('healthy');
      expect(result.services.redis.status).toBe('healthy');
      expect(result.services.database.status).toBe('healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('system');
      expect(result.system).toHaveProperty('memory');
      expect(result.system).toHaveProperty('nodeVersion');
    });

    it('should return degraded when redis is down', async () => {
      redis.isConnected.mockResolvedValue(false);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

      const result = await controller.checkAll();

      expect(result.status).toBe('degraded');
      expect(result.services.redis.status).toBe('unhealthy');
      expect(result.services.database.status).toBe('healthy');
    });

    it('should return degraded when database is down', async () => {
      redis.isConnected.mockResolvedValue(true);
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('connection refused'));

      const result = await controller.checkAll();

      expect(result.status).toBe('degraded');
      expect(result.services.redis.status).toBe('healthy');
      expect(result.services.database.status).toBe('unhealthy');
    });

    it('should return degraded when both services are down', async () => {
      redis.isConnected.mockResolvedValue(false);
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('connection refused'));

      const result = await controller.checkAll();

      expect(result.status).toBe('degraded');
      expect(result.services.redis.status).toBe('unhealthy');
      expect(result.services.database.status).toBe('unhealthy');
    });
  });

  // ──────────────────────────────────────────────
  //  GET /health/redis
  // ──────────────────────────────────────────────

  describe('checkRedis (GET /health/redis)', () => {
    it('should return healthy when redis is connected', async () => {
      redis.isConnected.mockResolvedValue(true);

      const result = await controller.checkRedis();

      expect(redis.isConnected).toHaveBeenCalled();
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('redis');
    });

    it('should return unhealthy when redis is disconnected', async () => {
      redis.isConnected.mockResolvedValue(false);

      const result = await controller.checkRedis();

      expect(result.status).toBe('unhealthy');
      expect(result.service).toBe('redis');
    });
  });

  // ──────────────────────────────────────────────
  //  GET /health/database
  // ──────────────────────────────────────────────

  describe('checkDatabase (GET /health/database)', () => {
    it('should return healthy when db query succeeds', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ 1: 1 }]);

      const result = await controller.checkDatabase();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('database');
    });

    it('should return unhealthy when db query fails', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('connection refused'));

      const result = await controller.checkDatabase();

      expect(result.status).toBe('unhealthy');
      expect(result.service).toBe('database');
    });
  });
});
