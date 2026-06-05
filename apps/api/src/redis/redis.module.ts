import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service.js';
import { HealthController } from './redis-health.controller.js';

@Global()
@Module({
  controllers: [HealthController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
