import { Column } from 'typeorm'
import { BaseEntity } from './base.entity'

export abstract class AuditableEntity extends BaseEntity {
    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy?: string

    @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updatedBy?: string
}
