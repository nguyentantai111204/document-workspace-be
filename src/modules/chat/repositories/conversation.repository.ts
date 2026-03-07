import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, IsNull, Brackets } from 'typeorm'
import { Conversation } from '../entities/conversation.entity'
import { ConversationType } from '../enums/conversation-type.enum'
import { ConversationQueryDto } from '../dto/conversation-query.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-result.interface'
import { buildPaginationMeta } from 'src/common/utils/pagination.utils'
import { CreateDirectConversation, GetUserConversations } from '../interfaces/conversation.interface'

@Injectable()
export class ConversationRepository {
    constructor(
        @InjectRepository(Conversation)
        private readonly repo: Repository<Conversation>,
    ) { }

    findById(id: string) {
        return this.repo.findOne({ where: { id, deletedAt: IsNull() } })
    }

    create(data: Partial<Conversation>) {
        const conversation = this.repo.create(data)
        return this.repo.save(conversation)
    }

    async update(id: string, data: Partial<Conversation>) {
        await this.repo.update(id, data)
        return this.findById(id)
    }

    findDirectConversation(
        params: CreateDirectConversation,
    ) {
        const { workspaceId, userId1, userId2, name } = params
        const query = this.repo
            .createQueryBuilder('c')
            .innerJoin(
                'conversation_participants',
                'cp1',
                'cp1.conversation_id = c.id AND cp1.user_id = :userId1 AND cp1.left_at IS NULL',
                { userId1 },
            )
            .innerJoin(
                'conversation_participants',
                'cp2',
                'cp2.conversation_id = c.id AND cp2.user_id = :userId2 AND cp2.left_at IS NULL',
                { userId2 },
            )
            .where('c.workspace_id = :workspaceId', { workspaceId })
            .andWhere('c.type = :type', { type: ConversationType.DIRECT })
            .andWhere('c.deletedAt IS NULL')

        if (name) {
            query.andWhere('c.name = :name', { name })
        } else {
            query.andWhere('c.name IS NULL')
        }

        return query.getOne()
    }

    findGroupByName(workspaceId: string, name: string) {
        return this.repo.findOne({
            where: {
                workspaceId,
                name,
                type: ConversationType.GROUP,
                deletedAt: IsNull(),
            },
        })
    }

    async getUserConversations(
        params: GetUserConversations,
    ): Promise<PaginatedResponse<Conversation>> {
        const { userId, workspaceId, query } = params
        const { page = 1, limit = 20, search } = query
        const skip = (page - 1) * limit

        const qb = this.repo
            .createQueryBuilder('c')
            .innerJoin(
                'conversation_participants',
                'cp',
                'cp.conversation_id = c.id AND cp.user_id = :userId AND cp.left_at IS NULL',
                { userId },
            )
            .where('c.workspace_id = :workspaceId', { workspaceId })
            .andWhere('c.deletedAt IS NULL')

        if (search) {
            qb.leftJoin('conversation_participants', 'search_cp', 'search_cp.conversation_id = c.id')
                .leftJoin('users', 'search_user', 'search_user.id = search_cp.user_id')
                .andWhere(new Brackets((qb) => {
                    qb.where('c.name ILIKE :search', { search: `%${search}%` })
                        .orWhere('search_user.fullName ILIKE :search', { search: `%${search}%` })
                        .orWhere('search_user.email ILIKE :search', { search: `%${search}%` })
                }))
        }

        qb.addSelect('COALESCE(c.last_message_at, c.created_at)', 'combined_sort_at')
            .orderBy('combined_sort_at', 'DESC')
            .skip(skip)
            .take(limit)

        const [items, total] = await qb.getManyAndCount()

        return {
            items,
            meta: buildPaginationMeta(page, limit, total),
        }
    }

    updateLastMessage(conversationId: string, messageId: string) {
        return this.repo.update(conversationId, {
            lastMessageId: messageId,
            lastMessageAt: new Date(),
        })
    }
}
