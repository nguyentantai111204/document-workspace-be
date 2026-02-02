import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { MessageRead } from './message-read.entity'

export interface MessageAttachment {
    type: 'image' | 'file' | 'video' | 'audio'
    url: string
    name: string
    size: number
    mimeType: string
}

@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class Message extends BaseEntity {
    @Column({ name: 'conversation_id', type: 'uuid' })
    @Index()
    conversationId: string

    @Column({ name: 'sender_id', type: 'uuid' })
    @Index()
    senderId: string

    @Column({ type: 'text' })
    content: string

    @Column({ type: 'jsonb', nullable: true })
    attachments?: MessageAttachment[]

    @Column({ name: 'parent_message_id', type: 'uuid', nullable: true })
    parentMessageId?: string

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>

    @OneToMany(() => MessageRead, read => read.message)
    reads: MessageRead[]
}
