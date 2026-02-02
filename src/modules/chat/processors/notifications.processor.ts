import { Process, Processor } from '@nestjs/bull'
import type { Job } from 'bull'
import { FirebaseService } from 'src/common/modules/firebase/firebase.service'
import { UserDeviceRepository } from 'src/modules/notifications/repositories/user-device.repository'
import { User } from 'src/modules/users/entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RedisService } from 'src/common/modules/redis/redis.service'

interface ChatNotificationJob {
    recipientIds: string[]
    messageId: string
    senderId: string
    content: string
    conversationId: string
    attachmentsCount: number
}

@Processor('notifications')
export class NotificationsProcessor {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly userDeviceRepo: UserDeviceRepository,
        private readonly redisService: RedisService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    @Process('send-chat-notification')
    async handleChatNotification(job: Job<ChatNotificationJob>) {
        const { recipientIds, messageId, senderId, content, conversationId, attachmentsCount } = job.data

        try {
            const keys = recipientIds.map(id => `chat:presence:${id}`)
            const onlineResults = await this.redisService.mget(keys)

            const offlineRecipientIds = recipientIds.filter((_, index) => onlineResults[index] === null)

            if (offlineRecipientIds.length === 0) {
                return
            }

            const sender = await this.userRepo.findOne({ where: { id: senderId } })
            if (!sender) return

            const messagePreview = attachmentsCount > 0
                ? `Sent ${attachmentsCount} attachment(s)`
                : content

            for (const userId of offlineRecipientIds) {
                const tokens = await this.userDeviceRepo.getTokensByUser(userId)

                if (tokens.length > 0) {
                    await this.firebaseService.sendToMultipleDevices(
                        tokens,
                        sender.fullName,
                        messagePreview,
                        {
                            type: 'chat_message',
                            conversationId: conversationId,
                            messageId: messageId,
                            senderId: senderId,
                        },
                    )
                }
            }
        } catch (error) {
            console.error(`Failed to process chat notification job ${job.id}:`, error)
        }
    }
}
