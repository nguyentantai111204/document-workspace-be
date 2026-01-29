import { Injectable } from '@nestjs/common'
import { NotificationRepository } from '../repositories/notification.repository'
import { NotificationType } from '../enums/notification-type.enum'
import { CreateNotificationDto } from '../dtos/create-notification.dto'
import { SocketGateway } from 'src/common/modules/socket/socket.gateway'
import { FirebaseService } from 'src/common/modules/firebase/firebase.service'
import { UserDeviceRepository } from '../repositories/user-device.repository'

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepo: NotificationRepository,
        private readonly socketGateway: SocketGateway,
        private readonly firebaseService: FirebaseService,
        private readonly userDeviceRepo: UserDeviceRepository,
    ) { }

    async create(dto: CreateNotificationDto) {
        const notification = await this.notificationRepo.create({
            ...dto,
            isRead: false,
        })

        this.socketGateway.sendToUser(notification.recipientId, 'notification.new', notification);

        // Send FCM
        const tokens = await this.userDeviceRepo.getTokensByUser(notification.recipientId);
        if (tokens.length > 0) {
            await this.firebaseService.sendToMultipleDevices(
                tokens,
                notification.title,
                notification.body,
                {
                    type: notification.type,
                    notificationId: notification.id,
                    data: JSON.stringify(notification.data || {}),
                }
            );
        }

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
