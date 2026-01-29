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
                });
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: ['REDIS', RedisService],
})
export class RedisModule { }

