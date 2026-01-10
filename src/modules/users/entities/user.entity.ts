import { BaseEntity } from "src/common/entities/base.entity"
import { Column, Entity } from "typeorm"
import { UserStatus } from "../enums/user-status.enum"

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string

  @Column({ select: false })
  password: string

  @Column({ name: 'full_name' })
  fullName: string

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus
}

