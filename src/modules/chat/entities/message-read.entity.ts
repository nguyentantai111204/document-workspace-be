import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { Message } from './message.entity'

@Entity('message_reads')
@Index(['messageId', 'userId'], { unique: true })
export class MessageRead extends BaseEntity {
    @Column({ name: 'message_id', type: 'uuid', nullable: true })
    @Index()
    messageId: string

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string

    @Column({ name: 'read_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    readAt: Date

    @ManyToOne(() => Message, message => message.reads, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message: Message
}
