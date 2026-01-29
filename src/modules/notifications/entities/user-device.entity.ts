import { BaseEntity } from "src/common/entities/base.entity"
import { Column, Entity } from "typeorm"

@Entity('user_devices')
export class UserDevice extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string

    @Column({ name: 'fcm_token' })
    fcmToken: string

    @Column({ name: 'device_id' })
    deviceId: string

    @Column({ name: 'device_type', nullable: true })
    deviceType: string // android, ios, web

    @Column({ name: 'last_active_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastActiveAt: Date
}
