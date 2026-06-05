import { Injectable, Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from './redis.service.js';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

const INCR_SCRIPT = `
  local key = KEYS[1]
  local ttl = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local blockDuration = tonumber(ARGV[3])

  -- Check if request is currently blocked
  local blockKey = key .. ":block"
  local blocked = redis.call("GET", blockKey)
  if blocked then
    local bpttl = redis.call("PTTL", blockKey)
    return { 0, 0, 1, bpttl }
  end

  -- Increment the rolling-window counter
  local count = redis.call("INCR", key)
  if count == 1 then
    redis.call("PEXPIRE", key, ttl)
  end

  local pttl = redis.call("PTTL", key)
  local isBlocked = 0
  local blockExpire = 0

  -- Exceeded the limit — set a block
  if count > limit and blockDuration > 0 then
    redis.call("SET", blockKey, "1", "PX", blockDuration)
    redis.call("PEXPIRE", key, blockDuration)
    local bpttl = redis.call("PTTL", blockKey)
    isBlocked = 1
    blockExpire = bpttl
  end

  return { count, pttl, isBlocked, blockExpire }
`;

@Injectable()
export class RedisThrottlerStorageService implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorageService.name);
  private redisDown = false;

  constructor(private redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `throttler:${throttlerName}:${key}`;

    try {
      const [totalHits, timeToExpire, isBlocked, timeToBlockExpire] =
        (await this.redis.eval(
          INCR_SCRIPT,
          1,
          redisKey,
          ttl.toString(),
          limit.toString(),
          blockDuration.toString(),
        )) as [number, number, number, number];

      // Log recovery when Redis comes back
      if (this.redisDown) {
        this.redisDown = false;
        this.logger.log('Redis connection restored — rate limiting re-enabled');
      }

      return {
        totalHits,
        timeToExpire: timeToExpire > 0 ? timeToExpire : 0,
        isBlocked: isBlocked === 1,
        timeToBlockExpire: timeToBlockExpire > 0 ? timeToBlockExpire : 0,
      };
    } catch (err) {
      if (!this.redisDown) {
        this.redisDown = true;
        this.logger.warn(
          `Redis unavailable — rate limiting temporarily disabled: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
      // Fail-open: allow request when Redis is down
      return {
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }
}
