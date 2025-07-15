import { Redis } from 'ioredis';
import { IRedisService } from '@/app/providers/redis.service';

export class RedisService implements IRedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async storeAccessToken(jti: string, ttl: number): Promise<void> {
    await this.client.set(`access_token:${jti}`, 'active', 'EX', ttl);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const result = await this.client.get(`blacklist:${jti}`);
    return !!result;
  }

  async blacklistToken(jti: string, ttl: number): Promise<void> {
    await this.client.set(`blacklist:${jti}`, 'blacklisted', 'EX', ttl);
  }
}