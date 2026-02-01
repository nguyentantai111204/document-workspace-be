import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { ConversationRole } from '../enums/conversation-role.enum'

@Entity('conversation_participants')
@Index(['conversationId', 'userId'], { unique: true })
export class ConversationParticipant extends BaseEntity {
    @Column({ name: 'conversation_id', type: 'uuid' })
    @Index()
    conversationId: string

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string

    @Column({
        type: 'enum',
        enum: ConversationRole,
        default: ConversationRole.MEMBER,
    })
    role: ConversationRole

    @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    joinedAt: Date

    @Column({ name: 'left_at', type: 'timestamp', nullable: true })
    leftAt?: Date

    @Column({ name: 'last_read_at', type: 'timestamp', nullable: true })
    lastReadAt?: Date

    @Column({ name: 'is_muted', default: false })
    isMuted: boolean
}
