import { BaseEntity } from 'src/common/entities/base.entity'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { User } from 'src/modules/users/entities/user.entity'

@Entity('key_tokens')
export class KeyToken extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ name: 'refresh_token_hash' })
    refreshToken: string

    @Column({ name: 'device_id', nullable: true })
    deviceId?: string

    @Column({ name: 'expires_at' })
    expiresAt: Date

    @Column({ name: 'is_revoked', default: false })
    isRevoked: boolean
}



