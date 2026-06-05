import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RedisService } from './redis.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Comprehensive health check — all services + system info' })
  async checkAll() {
    const [redisStatus, dbStatus] = await Promise.all([
      this.checkRedisInternal(),
      this.checkDatabaseInternal(),
    ]);

    const allHealthy = redisStatus.status === 'healthy' && dbStatus.status === 'healthy';

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services: {
        redis: redisStatus,
        database: dbStatus,
      },
      system: {
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()),
      },
    };
  }

  @Get('redis')
  @ApiOperation({ summary: 'Check Redis connection health' })
  async checkRedis() {
    return this.checkRedisInternal();
  }

  @Get('database')
  @ApiOperation({ summary: 'Check database (PostgreSQL) connection health' })
  async checkDatabase() {
    return this.checkDatabaseInternal();
  }

  private async checkRedisInternal() {
    const connected = await this.redis.isConnected();
    return {
      status: connected ? 'healthy' : 'unhealthy',
      service: 'redis',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabaseInternal() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        service: 'database',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'unhealthy',
        service: 'database',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
