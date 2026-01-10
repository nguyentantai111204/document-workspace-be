import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { RolePermission } from './role-permission.entity'
import { UserRole } from './user-role.entity'

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  description?: string

  @OneToMany(() => RolePermission, rp => rp.role)
  rolePermissions: RolePermission[]

  @OneToMany(() => UserRole, ur => ur.role)
  userRoles: UserRole[]
}
