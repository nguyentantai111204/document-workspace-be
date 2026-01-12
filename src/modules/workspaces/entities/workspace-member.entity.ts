import { Column, Entity, Index } from "typeorm"
import { WorkspaceRole } from "../enums/workspace-role.enum"
import { BaseEntity } from "src/common/entities/base.entity"

@Entity('workspace_members')
@Index(['workspaceId', 'userId'], { unique: true })
export class WorkspaceMember extends BaseEntity {
    @Column()
    workspaceId: string

    @Column()
    userId: string

    @Column({
        type: 'enum',
        enum: WorkspaceRole,
    })
    role: WorkspaceRole
}
