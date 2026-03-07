import { Injectable, ForbiddenException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MessageRepository } from '../repositories/message.repository'
import { ConversationParticipantRepository } from '../repositories/conversation-participant.repository'
import { ChatOnlineService } from './chat-online.service'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'
import { MessageAttachment } from '../entities/message.entity'
import { MessageSentEvent } from '../events/message-sent.event'
import {
    SendMessage,
    GetMessages,
    GetMessagesSince,
    MarkAsRead,
    MarkAllAsRead,
    GetUnreadCount,
    SearchMessages,
} from '../interfaces/message.interface'

@Injectable()
export class MessageService {
    constructor(
        private readonly messageRepo: MessageRepository,
        private readonly participantRepo: ConversationParticipantRepository,
        private readonly chatOnlineService: ChatOnlineService,
        private readonly eventEmitter: EventEmitter2,
        @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    ) { }

    async sendMessage(params: SendMessage) {
        const { conversationId, senderId, content, attachments } = params
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

        const onlineUsers = await this.chatOnlineService.getOnlineUsers({ userIds: recipientIds })
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

    async getMessages(params: GetMessages) {
        const { conversationId, userId, query } = params
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        return this.messageRepo.getMessages(params)
    }

    async getMessagesSince(params: GetMessagesSince) {
        const { conversationId, lastMessageId, userId } = params
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        return this.messageRepo.getMessagesSince(conversationId, lastMessageId)
    }

    async markAsRead(params: MarkAsRead) {
        const { messageId, userId } = params
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

        await this.participantRepo.updateLastRead(message.conversationId, userId, messageId)

        return { success: true }
    }

    async markAllAsRead(params: MarkAllAsRead) {
        const { conversationId, userId } = params
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        await this.participantRepo.updateLastRead(conversationId, userId)

        return { success: true }
    }

    async getUnreadCount(params: GetUnreadCount): Promise<number> {
        const { conversationId, userId } = params
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            return 0
        }

        return this.messageRepo.getUnreadMessages(params, participant.lastReadAt)
    }

    async searchMessages(params: SearchMessages) {
        return this.messageRepo.searchMessages(params)
    }

    async getMessageById(messageId: string) {
        return this.messageRepo.findById(messageId)
    }
}
