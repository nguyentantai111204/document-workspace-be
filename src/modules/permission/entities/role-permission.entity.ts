import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { Role } from './role.entity'
import { Permission } from './permission.entity'

@Entity('role_permissions')
export class RolePermission extends BaseEntity {
    @Column({ name: 'role_id' })
    roleId: string

    @Column({ name: 'permission_id' })
    permissionId: string

    @ManyToOne(() => Role, role => role.rolePermissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: Role

    @ManyToOne(() => Permission, p => p.rolePermissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permission_id' })
    permission: Permission
}
