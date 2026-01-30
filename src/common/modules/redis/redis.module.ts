import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS',
            useFactory: (configService: ConfigService) => {
                const redisConfig = configService.get('redis');
                return new Redis({
                    host: redisConfig.host,
                    port: redisConfig.port,
                    password: redisConfig.password,
                    db: redisConfig.db,
                    lazyConnect: true, // Không connect ngay, chỉ connect khi cần
                    maxRetriesPerRequest: 1, // Chỉ retry 1 lần thay vì 20 lần
                    connectTimeout: 2000, // Timeout 2s cho connection
                    retryStrategy: (times) => {
                        return null;
                    },
                    reconnectOnError: () => {
                        // Không reconnect tự động
                        return false;
                    },
                });
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: ['REDIS', RedisService],
})
export class RedisModule { }

