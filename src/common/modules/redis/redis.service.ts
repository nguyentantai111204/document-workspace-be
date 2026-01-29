import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(@Inject('REDIS') private readonly redis: Redis) { }

    onModuleDestroy() {
        this.redis.disconnect();
    }

    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<string> {
        if (ttl) {
            return this.redis.set(key, value, 'EX', ttl);
        }
        return this.redis.set(key, value);
    }

    async del(key: string): Promise<number> {
        return this.redis.del(key);
    }

    getClient(): Redis {
        return this.redis;
    }
}
