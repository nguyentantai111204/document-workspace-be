import { BaseEntity } from "src/common/entities/base.entity"
import { Column, Entity, OneToMany } from "typeorm"
import { WorkspaceMember } from "./workspace-member.entity"

@Entity('workspaces')
export class Workspace extends BaseEntity {
    @Column()
    name: string

    @Column({ unique: true })
    slug: string

    @Column({ name: 'owner_id' })
    ownerId: string

    @OneToMany(() => WorkspaceMember, member => member.workspace)
    members: WorkspaceMember[]
}
