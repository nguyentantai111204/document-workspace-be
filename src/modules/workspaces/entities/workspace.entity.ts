import { BaseEntity } from "src/common/entities/base.entity"
import { Column, Entity } from "typeorm"

@Entity('workspaces')
export class Workspace extends BaseEntity {
    @Column()
    name: string

    @Column({ unique: true })
    slug: string

    @Column({ name: 'owner_id' })
    ownerId: string
}
