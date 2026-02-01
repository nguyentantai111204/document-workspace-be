import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/common/modules/redis/redis.service'

@Injectable()
export class ChatOnlineService {
    constructor(private readonly redisService: RedisService) { }

    async setUserOnline(userId: string, socketId: string) {
        await this.redisService.sadd('chat:online_users', userId)

        await this.redisService.set(`chat:socket:${socketId}`, userId)

        await this.redisService.sadd(`chat:user_sockets:${userId}`, socketId)
    }

    async setUserOffline(userId: string, socketId: string) {
        await this.redisService.del(`chat:socket:${socketId}`)

        await this.redisService.srem(`chat:user_sockets:${userId}`, socketId)

        const remainingSockets = await this.redisService.smembers(`chat:user_sockets:${userId}`)

        if (!remainingSockets || remainingSockets.length === 0) {
            await this.redisService.srem('chat:online_users', userId)
            await this.redisService.del(`chat:user_sockets:${userId}`)
        }
    }

    async isUserOnline(userId: string): Promise<boolean> {
        return this.redisService.sismember('chat:online_users', userId)
    }

    async getOnlineUsers(userIds: string[]): Promise<string[]> {
        const onlineStatus = await Promise.all(
            userIds.map(id => this.isUserOnline(id)),
        )

        return userIds.filter((_, index) => onlineStatus[index])
    }

    async getAllOnlineUsers(): Promise<string[]> {
        return this.redisService.smembers('chat:online_users')
    }

    async getUserSocketIds(userId: string): Promise<string[]> {
        return this.redisService.smembers(`chat:user_sockets:${userId}`)
    }
}
