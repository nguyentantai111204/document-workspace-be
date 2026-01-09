import { Injectable, UnauthorizedException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { KeyToken } from "../entities/key-token.entity"
import { User } from "src/modules/users/entities/user.entity"

import * as bcrypt from 'bcrypt';
import { randomUUID } from "crypto"

@Injectable()
export class KeyTokenService {
    constructor(
        @InjectRepository(KeyToken)
        private readonly repo: Repository<KeyToken>,
    ) { }

    async create(params: {
        user: User
        refreshToken: string
        deviceId?: string
        expiresAt: Date
    }) {
        const hash = await bcrypt.hash(params.refreshToken, 10)
        const deviceId = params.deviceId ?? randomUUID();
        return this.repo.save(
            this.repo.create({
                user: params.user,
                refreshToken: hash,
                deviceId,
                expiresAt: params.expiresAt,
            }),
        )
    }

    async findValidToken(userId: string) {
        return this.repo.find({
            where: {
                user: { id: userId },
                isRevoked: false,
            },
            relations: ['user'],
        })
    }

    async revoke(token: KeyToken) {
        token.isRevoked = true
        return this.repo.save(token)
    }

    async revokeAll(userId: string) {
        await this.repo.update(
            { user: { id: userId } },
            { isRevoked: true },
        )
    }

    async findAndVerify(refreshToken: string, userId: string) {
        const tokens = await this.findValidToken(userId)

        for (const token of tokens) {
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
        }

        return null
    }
}
