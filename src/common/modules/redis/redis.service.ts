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
            this.logger.warn(`Redis unavailable for key ${key}, using fallback`);
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
            this.logger.warn(`Redis unavailable, skipping cache set for key ${key}`);
            return null;
        }
    }

    async del(key: string): Promise<number> {
        try {
            return await this.redis.del(key);
        } catch (error) {
            this.logger.warn(`Redis unavailable, skipping cache del for key ${key}`);
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
            this.logger.warn(`Redis unavailable for key ${key}, using fallback`);
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
            this.logger.warn(`Redis unavailable, skipping cache set for key ${key}`);
            return null;
        }
    }

    async remember<T>(
        key: string,
        ttl: number,
        callback: () => Promise<T>,
        cls?: ClassConstructor<T>,
        fallbackToDb: boolean = true,
    ): Promise<T> {
        try {
            const cached = await this.getJson<T>(key, cls);
            if (cached !== null) {
                return cached;
            }

            const value = await callback();

            if (value !== undefined) {
                await this.setJson(key, value, ttl);
            }

            return value;
        } catch (error) {
            if (fallbackToDb) {
                this.logger.warn(
                    `Redis error for key ${key}, falling back to database: ${error.message}`,
                );
                return await callback();
            }
            throw error;
        }
    }

    // Redis SET operations for chat online status
    async sadd(key: string, ...members: string[]): Promise<number> {
        try {
            return await this.redis.sadd(key, ...members);
        } catch (error) {
            this.logger.warn(`Redis unavailable, skipping sadd for key ${key}`);
            return 0;
        }
    }

    async srem(key: string, ...members: string[]): Promise<number> {
        try {
            return await this.redis.srem(key, ...members);
        } catch (error) {
            this.logger.warn(`Redis unavailable, skipping srem for key ${key}`);
            return 0;
        }
    }

    async smembers(key: string): Promise<string[]> {
        try {
            return await this.redis.smembers(key);
        } catch (error) {
            this.logger.warn(`Redis unavailable, returning empty set for key ${key}`);
            return [];
        }
    }

    async sismember(key: string, member: string): Promise<boolean> {
        try {
            const result = await this.redis.sismember(key, member);
            return result === 1;
        } catch (error) {
            this.logger.warn(`Redis unavailable, returning false for sismember ${key}`);
            return false;
        }
    }

    async mget(keys: string[]): Promise<(string | null)[]> {
        if (!keys || keys.length === 0) return []
        try {
            return await this.redis.mget(keys);
        } catch (error) {
            this.logger.warn(`Redis unavailable for mget, returning nulls`);
            return keys.map(() => null);
        }
    }

    getClient(): Redis {
        return this.redis;
    }
}
