import { Injectable } from '@nestjs/common'
import { NotificationRepository } from '../repositories/notification.repository'
import { NotificationType } from '../enums/notification-type.enum'
import { CreateNotificationDto } from '../dtos/create-notification.dto'

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
    ) { }

    async create(dto: CreateNotificationDto) {
        // Here we will add socket emission logic in Phase 2
        return this.notificationRepo.create({
            ...dto,
            isRead: false,
        })
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
