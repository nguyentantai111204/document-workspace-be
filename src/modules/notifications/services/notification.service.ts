import { Injectable } from '@nestjs/common'
import { NotificationRepository } from '../repositories/notification.repository'
import { NotificationType } from '../enums/notification-type.enum'
import { CreateNotificationDto } from '../dtos/create-notification.dto'
import { SocketGateway } from 'src/common/modules/socket/socket.gateway'

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
        private readonly socketGateway: SocketGateway,
    ) { }

    async create(dto: CreateNotificationDto) {
        const notification = await this.notificationRepo.create({
            ...dto,
            isRead: false,
        })

        // Emit real-time event
        this.socketGateway.sendToUser(notification.recipientId, 'notification.new', notification);

        return notification;
    }

    async listByUser(userId: string, page: number, limit: number) {
        const [notifications, unreadCount] = await Promise.all([
            this.notificationRepo.listByUser(userId, page, limit),
            this.notificationRepo.countUnread(userId)
        ])

        return {
            ...notifications,
            unreadCount
        }
    }

    async markAsRead(id: string, userId: string) {
        return this.notificationRepo.markAsRead(id, userId)
    }

    async markAllAsRead(userId: string) {
        return this.notificationRepo.markAllAsRead(userId)
    }
}
