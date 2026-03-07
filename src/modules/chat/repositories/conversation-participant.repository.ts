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

    create(data: Partial<ConversationParticipant>) {
        return this.repo.save(this.repo.create(data))
    }

    findByConversationAndUser(conversationId: string, userId: string) {
        return this.repo.findOne({
            where: {
                conversationId,
                userId,
                leftAt: IsNull(),
                deletedAt: IsNull(),
            },
        })
    }

    getParticipants(conversationId: string) {
        return this.repo.find({
            where: {
                conversationId,
                leftAt: IsNull(),
                deletedAt: IsNull(),
            },
        })
    }

    updateLastRead(conversationId: string, userId: string, messageId?: string) {
        const updateData: Partial<ConversationParticipant> = { lastReadAt: new Date() }
        if (messageId) {
            updateData.lastReadMessageId = messageId
        }
        return this.repo.update({ conversationId, userId }, updateData)
    }

    leaveConversation(conversationId: string, userId: string) {
        return this.repo.update(
            { conversationId, userId },
            { leftAt: new Date() },
        )
    }

    updateRole(conversationId: string, userId: string, role: ConversationRole) {
        return this.repo.update(
            { conversationId, userId },
            { role },
        )
    }

    toggleMute(conversationId: string, userId: string, isMuted: boolean) {
        return this.repo.update(
            { conversationId, userId },
            { isMuted },
        )
    }
}
