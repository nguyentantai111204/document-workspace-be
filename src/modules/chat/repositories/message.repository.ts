import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { Message } from '../entities/message.entity'
import { PaginatedResponse } from 'src/common/interfaces/paginated-result.interface'
import { buildPaginationMeta } from 'src/common/utils/pagination.utils'

@Injectable()
export class MessageRepository {
    constructor(
        @InjectRepository(Message)
        private readonly repo: Repository<Message>,
    ) { }

    findById(id: string) {
        return this.repo.findOne({ where: { id, deletedAt: IsNull() } })
    }

    async create(data: Partial<Message>) {
        const message = this.repo.create(data)
        return this.repo.save(message)
    }

    async getMessages(
        conversationId: string,
        page: number = 1,
        limit: number = 50,
    ): Promise<PaginatedResponse<Message>> {
        const skip = (page - 1) * limit

        const qb = this.repo
            .createQueryBuilder('m')
            .where('m.conversation_id = :conversationId', { conversationId })
            .andWhere('m.deletedAt IS NULL')
            .orderBy('m.createdAt', 'DESC')
            .skip(skip)
            .take(limit)

        const [items, total] = await qb.getManyAndCount()

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }

    async getUnreadMessages(
        conversationId: string,
        userId: string,
        lastReadAt?: Date,
    ): Promise<number> {
        const qb = this.repo
            .createQueryBuilder('m')
            .where('m.conversation_id = :conversationId', { conversationId })
            .andWhere('m.sender_id != :userId', { userId })
            .andWhere('m.deletedAt IS NULL')

        if (lastReadAt) {
            qb.andWhere('m.created_at > :lastReadAt', { lastReadAt })
        }

        return qb.getCount()
    }

    async searchMessages(
        userId: string,
        workspaceId: string,
        searchTerm: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<PaginatedResponse<Message>> {
        const skip = (page - 1) * limit

        const qb = this.repo
            .createQueryBuilder('m')
            .innerJoin('conversations', 'c', 'c.id = m.conversation_id')
            .innerJoin(
                'conversation_participants',
                'cp',
                'cp.conversation_id = c.id AND cp.user_id = :userId AND cp.left_at IS NULL',
                { userId },
            )
            .where('c.workspace_id = :workspaceId', { workspaceId })
            .andWhere('m.content ILIKE :search', { search: `%${searchTerm}%` })
            .andWhere('m.deletedAt IS NULL')
            .orderBy('m.createdAt', 'DESC')
            .skip(skip)
            .take(limit)

        const [items, total] = await qb.getManyAndCount()

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }
}
