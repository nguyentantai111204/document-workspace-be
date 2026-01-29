import { NotificationType } from "../enums/notification-type.enum"

export class CreateNotificationDto {
    recipientId: string
    senderId?: string
    type: NotificationType
    title: string
    body: string
    data?: any
}
