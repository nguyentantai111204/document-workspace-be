import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/common/modules/redis/redis.service'
import {
    SetUserOnline,
    SetUserPresence,
    SetUserOffline,
    IsUserOnline,
    GetOnlineUsers,
    GetUserSocketIds,
} from '../interfaces/chat-online.interface'

@Injectable()
export class ChatOnlineService {
    constructor(private readonly redisService: RedisService) { }

    async setUserOnline(params: SetUserOnline) {
        const { userId, socketId } = params
        await this.setUserPresence({ userId })

        await this.redisService.set(`chat:socket:${socketId}`, userId)
        await this.redisService.sadd(`chat:user_sockets:${userId}`, socketId)
    }

    async setUserPresence(params: SetUserPresence) {
        const { userId } = params
        await this.redisService.set(`chat:presence:${userId}`, '1', 60)
    }

    async setUserOffline(params: SetUserOffline) {
        const { userId, socketId } = params
        await this.redisService.del(`chat:socket:${socketId}`)

        await this.redisService.srem(`chat:user_sockets:${userId}`, socketId)
    }

    async isUserOnline(params: IsUserOnline): Promise<boolean> {
        const { userId } = params
        const presence = await this.redisService.get(`chat:presence:${userId}`)
        return !!presence
    }

    async getOnlineUsers(params: GetOnlineUsers): Promise<string[]> {
        const { userIds } = params
        if (!userIds || userIds.length === 0) return []

        const keys = userIds.map(id => `chat:presence:${id}`)
        const results = await this.redisService.mget(keys)

        return userIds.filter((_, index) => results[index] !== null)
    }

    async getAllOnlineUsers(): Promise<string[]> {
        return []
    }

    async getUserSocketIds(params: GetUserSocketIds): Promise<string[]> {
        const { userId } = params
        return this.redisService.smembers(`chat:user_sockets:${userId}`)
    }
}
