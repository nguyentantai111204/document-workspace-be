import { Injectable, ForbiddenException, forwardRef, Inject } from '@nestjs/common'
import { MessageRepository } from '../repositories/message.repository'
import { MessageReadRepository } from '../repositories/message-read.repository'
import { ConversationParticipantRepository } from '../repositories/conversation-participant.repository'
import { ConversationService } from './conversation.service'
import { ChatOnlineService } from './chat-online.service'
import { FirebaseService } from 'src/common/modules/firebase/firebase.service'
import { UserDeviceRepository } from 'src/modules/notifications/repositories/user-device.repository'
import { BadRequestError } from 'src/common/exceptions/bad-request.exception'
import { Message, MessageAttachment } from '../entities/message.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'

@Injectable()
export class MessageService {
    constructor(
        private readonly messageRepo: MessageRepository,
        private readonly messageReadRepo: MessageReadRepository,
        private readonly participantRepo: ConversationParticipantRepository,
        @Inject(forwardRef(() => ConversationService))
        private readonly conversationService: ConversationService,
        private readonly chatOnlineService: ChatOnlineService,
        private readonly firebaseService: FirebaseService,
        private readonly userDeviceRepo: UserDeviceRepository,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async sendMessage(
        conversationId: string,
        senderId: string,
        content: string,
        attachments?: MessageAttachment[],
    ) {
        // 1. Validate: Sender must be participant
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            senderId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant of this conversation')
        }

        // 2. Save message
        const message = await this.messageRepo.create({
            conversationId,
            senderId,
            content,
            attachments,
        })

        // 3. Update conversation last message
        await this.conversationService.updateLastMessage(conversationId, message.id)

        // 4. Get all participants except sender
        const participants = await this.participantRepo.getParticipants(conversationId)
        const recipientIds = participants
            .filter(p => p.userId !== senderId)
            .map(p => p.userId)

        // 5. Check who is online
        const onlineUsers = await this.chatOnlineService.getOnlineUsers(recipientIds)
        const offlineUsers = recipientIds.filter(id => !onlineUsers.includes(id))

        // 6. Send FCM to offline users (don't block)
        if (offlineUsers.length > 0) {
            this.sendPushNotifications(offlineUsers, message, senderId).catch(err => {
                console.error('Failed to send push notifications:', err)
            })
        }

        return message
    }

    async getMessages(
        conversationId: string,
        userId: string,
        limit: number = 50,
        cursor?: string,
    ) {
        // Validate: User must be participant
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        const messages = await this.messageRepo.getMessages(conversationId, limit, cursor)

        return {
            messages,
            hasMore: messages.length === limit,
            nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
        }
    }

    async markAsRead(messageId: string, userId: string) {
        const message = await this.messageRepo.findById(messageId)

        if (!message) {
            throw new BadRequestError('Message not found')
        }

        // Validate: User must be participant
        const participant = await this.participantRepo.findByConversationAndUser(
            message.conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        // Don't mark own messages as read
        if (message.senderId === userId) {
            return { success: true }
        }

        await this.messageReadRepo.markAsRead(messageId, userId)

        return { success: true }
    }

    async markAllAsRead(conversationId: string, userId: string) {
        // Validate: User must be participant
        const participant = await this.participantRepo.findByConversationAndUser(
            conversationId,
            userId,
        )

        if (!participant) {
            throw new ForbiddenException('You are not a participant')
        }

        // Update last read timestamp
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
        limit: number = 20,
    ) {
        return this.messageRepo.searchMessages(userId, workspaceId, searchTerm, limit)
    }

    // Private methods

    private async sendPushNotifications(
        userIds: string[],
        message: Message,
        senderId: string,
    ) {
        try {
            // Get sender info
            const sender = await this.userRepo.findOne({ where: { id: senderId } })

            if (!sender) {
                return
            }

            // Send FCM to each offline user
            for (const userId of userIds) {
                // Check if conversation is muted
                const participant = await this.participantRepo.findByConversationAndUser(
                    message.conversationId,
                    userId,
                )

                if (participant?.isMuted) {
                    continue // Skip muted conversations
                }

                // Get user's FCM tokens
                const tokens = await this.userDeviceRepo.getTokensByUser(userId)

                if (tokens.length > 0) {
                    const messagePreview = message.attachments && message.attachments.length > 0
                        ? `Sent ${message.attachments.length} attachment(s)`
                        : message.content

                    await this.firebaseService.sendToMultipleDevices(
                        tokens,
                        sender.fullName,
                        messagePreview,
                        {
                            type: 'chat_message',
                            conversationId: message.conversationId,
                            messageId: message.id,
                            senderId: senderId,
                        },
                    )
                }
            }
        } catch (error) {
            console.error('Error sending push notifications:', error)
        }
    }
}
