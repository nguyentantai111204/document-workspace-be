import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { RolePermission } from './role-permission.entity'

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ unique: true })
  code: string // vd: user.read, user.create

  @Column({ nullable: true })
  description?: string

  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions: RolePermission[]
}
