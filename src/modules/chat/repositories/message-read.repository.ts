import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { MessageRead } from '../entities/message-read.entity'

@Injectable()
export class MessageReadRepository {
    constructor(
        @InjectRepository(MessageRead)
        private readonly repo: Repository<MessageRead>,
    ) { }

    async markAsRead(messageId: string, userId: string) {
        // Use upsert to avoid duplicates
        const existing = await this.repo.findOne({
            where: { messageId, userId },
        })

        if (existing) {
            return existing
        }

        const messageRead = this.repo.create({
            messageId,
            userId,
        })

        return this.repo.save(messageRead)
    }

    async getReadReceipts(messageId: string): Promise<MessageRead[]> {
        return this.repo.find({
            where: { messageId },
        })
    }

    async hasUserReadMessage(messageId: string, userId: string): Promise<boolean> {
        const count = await this.repo.count({
            where: { messageId, userId },
        })
        return count > 0
    }

    async markMultipleAsRead(messageIds: string[], userId: string) {
        const reads = messageIds.map((messageId) =>
            this.repo.create({ messageId, userId }),
        )

        // Use INSERT ... ON CONFLICT DO NOTHING for batch insert
        return this.repo
            .createQueryBuilder()
            .insert()
            .into(MessageRead)
            .values(reads)
            .orIgnore()
            .execute()
    }
}
