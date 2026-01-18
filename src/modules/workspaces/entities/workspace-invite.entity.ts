import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { WorkspaceRole } from '../enums/workspace-role.enum'
import { Workspace } from './workspace.entity'

@Entity('workspace_invites')
@Index(['workspaceId', 'email'], { unique: true })
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

    @Column({ name: 'invited_by' })
    invitedBy: string

    @Column({ type: 'timestamp' })
    expiredAt: Date

    @Column({ default: 'pending' })
    status: 'pending' | 'accepted' | 'expired'

    @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspace_id' })
    workspace: Workspace
}
