// file.entity.ts
import { Column, Entity } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { FileStatus } from '../enums/file-status.enum'

@Entity('files')
export class FileEntity extends BaseEntity {
    @Column({ name: 'workspace_id' })
    workspaceId: string

    @Column({ name: 'owner_id' })
    ownerId: string

    @Column()
    name: string

    @Column({ name: 'mime_type' })
    mimeType: string

    @Column()
    size: number

    @Column()
    url: string

    @Column({ name: 'public_id' })
    publicId: string

    @Column({
        type: 'enum',
        enum: FileStatus,
        default: FileStatus.ACTIVE,
    })
    status: FileStatus
}
