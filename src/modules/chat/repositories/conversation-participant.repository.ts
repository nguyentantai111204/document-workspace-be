import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, IsNull } from 'typeorm'
import { ConversationParticipant } from '../entities/conversation-participant.entity'
import { ConversationRole } from '../enums/conversation-role.enum'

@Injectable()
export class ConversationParticipantRepository {
    constructor(
        @InjectRepository(ConversationParticipant)
        private readonly repo: Repository<ConversationParticipant>,
    ) { }

    async create(data: Partial<ConversationParticipant>) {
        const participant = this.repo.create(data)
        return this.repo.save(participant)
    }

    async findByConversationAndUser(
        conversationId: string,
        userId: string,
    ): Promise<ConversationParticipant | null> {
        return this.repo.findOne({
            where: {
                conversationId,
                userId,
                leftAt: IsNull(),
                deletedAt: IsNull(),
            },
        })
    }

    async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
        return this.repo.find({
            where: {
                conversationId,
                leftAt: IsNull(),
                deletedAt: IsNull(),
            },
        })
    }

    async updateLastReadAt(conversationId: string, userId: string) {
        return this.repo.update(
            { conversationId, userId },
            { lastReadAt: new Date() },
        )
    }

    async leaveConversation(conversationId: string, userId: string) {
        return this.repo.update(
            { conversationId, userId },
            { leftAt: new Date() },
        )
    }

    async updateRole(conversationId: string, userId: string, role: ConversationRole) {
        return this.repo.update(
            { conversationId, userId },
            { role },
        )
    }

    async toggleMute(conversationId: string, userId: string, isMuted: boolean) {
        return this.repo.update(
            { conversationId, userId },
            { isMuted },
        )
    }
}
