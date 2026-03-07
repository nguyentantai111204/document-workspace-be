import { Column, Entity, Index, ManyToOne, JoinColumn } from "typeorm"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { BaseEntity } from "src/common/entities/base.entity"
import { Workspace } from "./workspace.entity"

@Entity('workspace_members')
@Index(['workspaceId', 'userId'], { unique: true })
export class WorkspaceMember extends BaseEntity {
    @Column({ name: 'workspace_id', type: 'uuid' })
    workspaceId: string

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string

    @Column({
        type: 'enum',
        enum: WorkspaceRole,
    })
    role: WorkspaceRole

    @Column({ default: 'active' })
    status: 'active' | 'invited' | 'removed'

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'joined_at', })
    joinedAt: Date

    @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspace_id' })
    workspace: Workspace
}

