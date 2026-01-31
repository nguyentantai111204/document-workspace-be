import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { ConversationType } from '../enums/conversation-type.enum'

@Entity('conversations')
@Index(['workspaceId', 'lastMessageAt'])
export class Conversation extends BaseEntity {
    @Column({ name: 'workspace_id' })
    @Index()
    workspaceId: string

    @Column({
        type: 'enum',
        enum: ConversationType,
    })
    type: ConversationType

    @Column({ nullable: true })
    name?: string

    @Column({ name: 'avatar_url', nullable: true })
    avatarUrl?: string

    @Column({ name: 'last_message_id', nullable: true })
    lastMessageId?: string

    @Column({ name: 'last_message_at', nullable: true })
    lastMessageAt?: Date
}
