import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.module';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async setCacheTtl(key: string, value: string, ttl: number) {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async setCache(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async getCache(key: string) {
    return await this.redis.get(key);
  }
}
