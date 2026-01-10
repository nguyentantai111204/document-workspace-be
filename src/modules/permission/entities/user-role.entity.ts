import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm'
import { BaseEntity } from 'src/common/entities/base.entity'
import { User } from 'src/modules/users/entities/user.entity'
import { Role } from './role.entity'

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'role_id' })
  roleId: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Role, role => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role
}
