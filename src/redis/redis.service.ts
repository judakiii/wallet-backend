import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.module';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async setCache(key: string, value: string) {
    await this.redis.set(key, value, 'EX', 5 * 60);
  }

  async getCache(key: string) {
    return await this.redis.get(key);
  }
}
