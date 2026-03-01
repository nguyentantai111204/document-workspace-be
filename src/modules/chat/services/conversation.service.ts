import { Injectable, ForbiddenException } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ConversationRepository } from '../repositories/conversation.repository'
import { ConversationParticipantRepository } from '../repositories/conversation-participant.repository'
import { WorkspaceMemberService } from 'src/modules/workspaces/services/workspace-member.service'
import { ConversationType } from '../enums/conversation-type.enum'
import { ConversationRole } from '../enums/conversation-role.enum'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'
import { ConversationQueryDto } from '../dto/conversation-query.dto'
import { ChatOnlineService } from './chat-online.service'
import { MessageService } from './message.service'
import { MessageSentEvent } from '../events/message-sent.event'

@Injectable()
export class ConversationService {
    constructor(
        private readonly conversationRepo: ConversationRepository,
        private readonly participantRepo: ConversationParticipantRepository,
        private readonly workspaceMemberService: WorkspaceMemberService,
        private readonly chatOnlineService: ChatOnlineService,
        private readonly messageService: MessageService,
    ) { }

    async createDirectConversation(
        workspaceId: string,
        userId1: string,
        userId2: string,
    ) {
        await this.validateWorkspaceMembership(workspaceId, [userId1, userId2])

        const existing = await this.conversationRepo.findDirectConversation(
            workspaceId,
            userId1,
            userId2,
        )

        if (existing) {
            return existing
        }

        const conversation = await this.conversationRepo.create({
            workspaceId,
            type: ConversationType.DIRECT,
        })

        await this.participantRepo.create({
            conversationId: conversation.id,
            userId: userId1,
            role: ConversationRole.MEMBER,
        })

        await this.participantRepo.create({
            conversationId: conversation.id,
            userId: userId2,
            role: ConversationRole.MEMBER,
        })

        return conversation
    }

    async createGroupConversation(
        workspaceId: string,
        creatorId: string,
        name: string,
        participantIds: string[],
    ) {
        await this.validateWorkspaceMembership(workspaceId, [creatorId])

        const allParticipants = Array.from(new Set([creatorId, ...participantIds]))
        await this.validateWorkspaceMembership(workspaceId, allParticipants)

        const conversation = await this.conversationRepo.create({
            workspaceId,
            type: ConversationType.GROUP,
            name,
        })

        await this.participantRepo.create({
            conversationId: conversation.id,
            userId: creatorId,
            role: ConversationRole.ADMIN,
        })

        for (const userId of participantIds) {
            if (userId !== creatorId) {
                await this.participantRepo.create({
                    conversationId: conversation.id,
                    userId,
                    role: ConversationRole.MEMBER,
                })
            }
        }

        return conversation
    }

    async getUserConversations(
        userId: string,
        workspaceId: string,
        query: ConversationQueryDto,
    ) {
        await this.validateWorkspaceMembership(workspaceId, [userId])

        return this.conversationRepo.getUserConversations(userId, workspaceId, query)
    }

    async getConversationById(conversationId: string, userId: string) {
        const conversation = await this.conversationRepo.findById(conversationId)

        if (!conversation) {
            throw new BadRequestError('Conversation not found')
        }

        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant of this conversation')
        }

        return conversation
    }

    async updateConversation(
        conversationId: string,
        userId: string,
        data: { name?: string; avatarUrl?: string },
    ) {
        const conversation = await this.conversationRepo.findById(conversationId)

        if (!conversation) {
            throw new BadRequestError('Conversation not found')
        }

        if (conversation.type === ConversationType.GROUP) {
            await this.validateParticipantRole(
                conversationId,
                userId,
                ConversationRole.ADMIN,
            )
        }

        return this.conversationRepo.update(conversationId, data)
    }

    async addParticipant(
        conversationId: string,
        newUserId: string,
        requesterId: string,
    ) {
        const conversation = await this.conversationRepo.findById(conversationId)

        if (!conversation) {
            throw new BadRequestError('Conversation not found')
        }

        await this.validateWorkspaceMembership(conversation.workspaceId, [newUserId])

        if (conversation.type === ConversationType.GROUP) {
            await this.validateParticipantRole(
                conversationId,
                requesterId,
                ConversationRole.ADMIN,
            )
        } else {
            throw new BadRequestError('Cannot add participants to direct conversations')
        }

        const existing = await this.participantRepo.findByConversationAndUser(
            conversationId,
            newUserId,
        )

        if (existing) {
            throw new BadRequestError('User is already a participant')
        }

        return this.participantRepo.create({
            conversationId,
            userId: newUserId,
            role: ConversationRole.MEMBER,
        })
    }

    async leaveConversation(conversationId: string, userId: string) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new BadRequestError('You are not a participant')
        }

        return this.participantRepo.leaveConversation(conversationId, userId)
    }

    async getParticipants(conversationId: string, userId: string) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        return this.participantRepo.getParticipants(conversationId)
    }

    async getUnreadCount(userId: string, conversationId: string): Promise<number> {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            return 0
        }

        return this.messageService.getUnreadCount(conversationId, userId)
    }

    async updateLastMessage(conversationId: string, messageId: string) {
        return this.conversationRepo.updateLastMessage(conversationId, messageId)
    }

    async getOnlineParticipants(conversationId: string, userId: string) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        const participants = await this.participantRepo.getParticipants(conversationId)
        const participantIds = participants.map(p => p.userId)

        return this.chatOnlineService.getOnlineUsers(participantIds)
    }


    private async validateWorkspaceMembership(
        workspaceId: string,
        userIds: string[],
    ) {
        for (const userId of userIds) {
            const role = await this.workspaceMemberService.getUserRole(workspaceId, userId)

            if (!role) {
                throw new ForbiddenException(
                    `User ${userId} is not a member of this workspace`,
                )
            }
        }
    }

    private async validateParticipantRole(
        conversationId: string,
        userId: string,
        requiredRole: ConversationRole,
    ) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        if (participant.role !== requiredRole) {
            throw new ForbiddenException(`You must be a ${requiredRole} to perform this action`)
        }
    }

    @OnEvent('message.sent')
    async handleMessageSent(event: MessageSentEvent) {
        await this.conversationRepo.updateLastMessage(event.conversationId, event.messageId)
    }
}
