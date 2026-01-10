import { Injectable, UnauthorizedException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, EntityManager, LessThan } from "typeorm"
import { KeyToken } from "../entities/key-token.entity"
import { User } from "src/modules/users/entities/user.entity"
import { Cron, CronExpression } from '@nestjs/schedule'
import * as bcrypt from 'bcrypt'
import { randomUUID } from "crypto"

@Injectable()
export class KeyTokenService {
    constructor(
        @InjectRepository(KeyToken)
        private readonly repo: Repository<KeyToken>,
    ) { }

    async create(
        params: {
            user: User
            refreshToken: string
            deviceId?: string
            expiresAt: Date
        },
        manager?: EntityManager,
    ) {
        const repository = manager?.getRepository(KeyToken) ?? this.repo

        const hash = await bcrypt.hash(params.refreshToken, 10)
        const deviceId = params.deviceId ?? randomUUID()

        return repository.save(
            repository.create({
                user: params.user,
                refreshToken: hash,
                deviceId,
                expiresAt: params.expiresAt,
            }),
        )
    }

    async findValidToken(userId: string, manager?: EntityManager) {
        const repository = manager?.getRepository(KeyToken) ?? this.repo

        return repository.find({
            where: {
                user: { id: userId },
                isRevoked: false,
            },
            relations: ['user'],
        })
    }

    async revoke(token: KeyToken, manager?: EntityManager) {
        const repository = manager?.getRepository(KeyToken) ?? this.repo

        token.isRevoked = true
        return repository.save(token)
    }

    async revokeAll(userId: string, manager?: EntityManager) {
        const repository = manager?.getRepository(KeyToken) ?? this.repo

        const result = await repository.update(
            { user: { id: userId }, isRevoked: false },
            { isRevoked: true },
        )

        return result.affected ?? 0
    }

    async findAndVerify(
        refreshToken: string,
        userId: string,
        manager?: EntityManager,
    ) {
        const tokens = await this.findValidToken(userId, manager)

        if (tokens.length === 0) {
            return null
        }

        for (const token of tokens) {
            try {
                const match = await bcrypt.compare(
                    refreshToken,
                    token.refreshToken,
                )

                if (match) {
                    if (token.expiresAt < new Date()) {
                        throw new UnauthorizedException('Refresh token đã hết hạn')
                    }
                    return token
                }
            } catch (error) {
                if (error instanceof UnauthorizedException) {
                    throw error
                }
                continue
            }
        }

        return null
    }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanupExpiredTokens() {
        const result = await this.repo.delete({
            expiresAt: LessThan(new Date()),
        })

        console.log(`Cleaned up ${result.affected} expired tokens`)
        return result.affected
    }

    async removeExpiredTokens() {
        return this.cleanupExpiredTokens()
    }

    async getActiveSessions(userId: string) {
        return this.repo.find({
            where: {
                user: { id: userId },
                isRevoked: false,
            },
            select: ['id', 'deviceId', 'createdAt', 'expiresAt'],
            order: {
                createdAt: 'DESC',
            },
        })
    }

    async revokeSession(userId: string, sessionId: string) {
        const result = await this.repo.update(
            {
                id: sessionId,
                user: { id: userId },
                isRevoked: false,
            },

            { isRevoked: true },
        )

        return (result.affected ?? 0) > 0;
    }
}