import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject('REDIS') private readonly redis: Redis) { }

    onModuleDestroy() {
        this.redis.disconnect();
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.redis.get(key);
        } catch (error) {
            this.logger.error(`Redis get error for key ${key}: ${error.message}`);
            return null;
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<string | null> {
        try {
            if (ttl) {
                return await this.redis.set(key, value, 'EX', ttl);
            }
            return await this.redis.set(key, value);
        } catch (error) {
            this.logger.error(`Redis set error for key ${key}: ${error.message}`);
            return null;
        }
    }

    async del(key: string): Promise<number> {
        try {
            return await this.redis.del(key);
        } catch (error) {
            this.logger.error(`Redis del error for key ${key}: ${error.message}`);
            return 0;
        }
    }

    async getJson<T>(key: string, cls?: ClassConstructor<T>): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            if (!value) return null;

            const parsed = JSON.parse(value);
            if (cls) {
                return plainToInstance(cls, parsed);
            }

            return parsed as T;
        } catch (error) {
            this.logger.error(`Redis getJson error for key ${key}: ${error.message}`);
            return null;
        }
    }

    async setJson(key: string, value: any, ttl?: number): Promise<string | null> {
        try {
            const jsonValue = JSON.stringify(value);
            if (ttl) {
                return await this.redis.set(key, jsonValue, 'EX', ttl);
            }
            return await this.redis.set(key, jsonValue);
        } catch (error) {
            this.logger.error(`Redis setJson error for key ${key}: ${error.message}`);
            return null;
        }
    }

    async remember<T>(
        key: string,
        ttl: number,
        callback: () => Promise<T>,
        cls?: ClassConstructor<T>,
    ): Promise<T> {
        const cached = await this.getJson<T>(key, cls);
        if (cached !== null) {
            return cached;
        }

        const value = await callback();

        if (value !== undefined) {
            await this.setJson(key, value, ttl);
        }

        return value;
    }

    getClient(): Redis {
        return this.redis;
    }
}
