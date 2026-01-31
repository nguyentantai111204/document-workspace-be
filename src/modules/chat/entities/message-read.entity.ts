import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'

@Entity('message_reads')
@Index(['messageId', 'userId'], { unique: true })
export class MessageRead extends BaseEntity {
    @Column({ name: 'message_id' })
    @Index()
    messageId: string

    @Column({ name: 'user_id' })
    @Index()
    userId: string

    @Column({ name: 'read_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    readAt: Date
}
