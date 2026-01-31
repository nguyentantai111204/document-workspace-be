import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/common/modules/redis/redis.service'

@Injectable()
export class ChatOnlineService {
    constructor(private readonly redisService: RedisService) { }

    async setUserOnline(userId: string, socketId: string) {
        // Add user to online users set
        await this.redisService.sadd('chat:online_users', userId)

        // Track socket -> user mapping (TTL 24 hours)
        await this.redisService.set(`chat:socket:${socketId}`, userId, 86400)

        // Track user -> sockets mapping (for multiple devices)
        await this.redisService.sadd(`chat:user:${userId}:sockets`, socketId)
    }

    async setUserOffline(userId: string, socketId: string) {
        // Remove socket mapping
        await this.redisService.del(`chat:socket:${socketId}`)

        // Remove socket from user's socket set
        await this.redisService.srem(`chat:user:${userId}:sockets`, socketId)

        // Check if user has other active sockets
        const remainingSockets = await this.redisService.smembers(`chat:user:${userId}:sockets`)

        if (!remainingSockets || remainingSockets.length === 0) {
            // No more active sockets, mark user as offline
            await this.redisService.srem('chat:online_users', userId)
            await this.redisService.del(`chat:user:${userId}:sockets`)
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
        return this.redisService.smembers(`chat:user:${userId}:sockets`)
    }
}
