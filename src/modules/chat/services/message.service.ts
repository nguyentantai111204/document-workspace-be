import { Injectable, ForbiddenException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MessageRepository } from '../repositories/message.repository'
import { MessageReadRepository } from '../repositories/message-read.repository'
import { ConversationParticipantRepository } from '../repositories/conversation-participant.repository'
import { ChatOnlineService } from './chat-online.service'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'
import { MessageAttachment } from '../entities/message.entity'
import { MessageSentEvent } from '../events/message-sent.event'

@Injectable()
export class MessageService {
    constructor(
        private readonly messageRepo: MessageRepository,
        private readonly messageReadRepo: MessageReadRepository,
        private readonly participantRepo: ConversationParticipantRepository,
        private readonly chatOnlineService: ChatOnlineService,
        private readonly eventEmitter: EventEmitter2,
        @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    ) { }

    async sendMessage(
        conversationId: string,
        senderId: string,
        content: string,
        attachments?: MessageAttachment[],
    ) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            senderId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant of this conversation')
        }

        const message = await this.messageRepo.create({
            conversationId,
            senderId,
            content,
            attachments,
        })

        await this.eventEmitter.emitAsync(
            'message.sent',
            new MessageSentEvent(conversationId, message.id),
        )

        const participants = await this.participantRepo.getParticipants(conversationId)
        const recipientIds = participants
            .filter(p => p.userId !== senderId)
            .map(p => p.userId)

        const onlineUsers = await this.chatOnlineService.getOnlineUsers(recipientIds)
        const offlineUsers = recipientIds.filter(id => !onlineUsers.includes(id))

        if (offlineUsers.length > 0) {
            await this.notificationsQueue.add('send-chat-notification', {
                recipientIds: offlineUsers,
                messageId: message.id,
                senderId: senderId,
                content: message.content,
                conversationId: message.conversationId,
                attachmentsCount: message.attachments?.length || 0,
            })
        }

        return message
    }

    async getMessages(
        conversationId: string,
        userId: string,
        page: number = 1,
        limit: number = 50,
    ) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        return this.messageRepo.getMessages(conversationId, page, limit)
    }

    async getMessagesSince(
        conversationId: string,
        lastMessageId: string,
        userId: string,
    ) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        return this.messageRepo.getMessagesSince(conversationId, lastMessageId)
    }

    async markAsRead(messageId: string, userId: string) {
        const message = await this.messageRepo.findById(messageId)

        if (!message) {
            throw new BadRequestError('Message not found')
        }

        const participant = await this.participantRepo.findByConversationAndUser(
            message.conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        if (message.senderId === userId) {
            return { success: true }
        }

        await this.messageReadRepo.markAsRead(messageId, userId)

        return { success: true }
    }

    async markAllAsRead(conversationId: string, userId: string) {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        await this.participantRepo.updateLastReadAt(conversationId, userId)

        return { success: true }
    }

    async getUnreadCount(conversationId: string, userId: string): Promise<number> {
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            return 0
        }

        return this.messageRepo.getUnreadMessages(
            conversationId,
            userId,
            participant.lastReadAt,
        )
    }

    async searchMessages(
        userId: string,
        workspaceId: string,
        searchTerm: string,
        page: number = 1,
        limit: number = 20,
    ) {
        return this.messageRepo.searchMessages(userId, workspaceId, searchTerm, page, limit)
    }

    async getMessageById(messageId: string) {
        return this.messageRepo.findById(messageId)
    }
}
