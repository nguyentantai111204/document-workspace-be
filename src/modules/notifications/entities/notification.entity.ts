import { BaseEntity } from "src/common/entities/base.entity"
import { Column, Entity } from "typeorm"
import { NotificationType } from "../enums/notification-type.enum"

@Entity('notifications')
export class Notification extends BaseEntity {
    @Column({ name: 'recipient_id' })
    recipientId: string

    @Column({ name: 'sender_id', nullable: true })
    senderId: string

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.SYSTEM
    })
    type: NotificationType

    @Column()
    title: string

    @Column({ type: 'text', nullable: true })
    body: string

    @Column({ type: 'jsonb', nullable: true })
    data: any

    @Column({ name: 'is_read', default: false })
    isRead: boolean
}
