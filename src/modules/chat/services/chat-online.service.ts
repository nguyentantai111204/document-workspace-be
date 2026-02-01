import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/common/modules/redis/redis.service'

@Injectable()
export class ChatOnlineService {
    constructor(private readonly redisService: RedisService) { }

    async setUserOnline(userId: string, socketId: string) {
        await this.setUserPresence(userId)

        await this.redisService.set(`chat:socket:${socketId}`, userId)
        await this.redisService.sadd(`chat:user_sockets:${userId}`, socketId)
    }

    async setUserPresence(userId: string) {
        await this.redisService.set(`chat:presence:${userId}`, '1', 60)
    }

    async setUserOffline(userId: string, socketId: string) {
        await this.redisService.del(`chat:socket:${socketId}`)

        await this.redisService.srem(`chat:user_sockets:${userId}`, socketId)

        // We do NOT remove `chat:presence:{userId}` immediately.
        // Let TTL expire naturally to handle distinct device disconnections gracefully.
    }

    async isUserOnline(userId: string): Promise<boolean> {
        const presence = await this.redisService.get(`chat:presence:${userId}`)
        return !!presence
    }

    async getOnlineUsers(userIds: string[]): Promise<string[]> {
        if (!userIds || userIds.length === 0) return []

        const keys = userIds.map(id => `chat:presence:${id}`)
        const results = await this.redisService.mget(keys)

        return userIds.filter((_, index) => results[index] !== null)
    }

    // Deprecated: No longer maintaining a global set of online users
    // If needed, would require SCAN or keeping the set (but handling Sync issues)
    async getAllOnlineUsers(): Promise<string[]> {
        return []
    }

    async getUserSocketIds(userId: string): Promise<string[]> {
        return this.redisService.smembers(`chat:user_sockets:${userId}`)
    }
}
