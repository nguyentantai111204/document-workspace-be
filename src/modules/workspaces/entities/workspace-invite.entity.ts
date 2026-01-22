import { Column, Entity } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { WorkspaceRole } from '../enums/workspace-role.enum'
import { WorkspaceInviteStatus } from '../enums/workspace-invite-status.enum'


@Entity('workspace_invites')
export class WorkspaceInvite extends BaseEntity {
    @Column({ name: 'workspace_id' })
    workspaceId: string

    @Column()
    email: string

    @Column({
        type: 'enum',
        enum: WorkspaceRole,
    })
    role: WorkspaceRole

    @Column({ unique: true })
    token: string

    @Column({
        type: 'enum',
        enum: WorkspaceInviteStatus,
        default: WorkspaceInviteStatus.PENDING,
    })
    status: WorkspaceInviteStatus

    @Column({ name: 'invited_by' })
    invitedBy: string

    @Column({ name: 'expired_at' })
    expiredAt: Date
}
