import { BaseEntity } from "src/common/entities/base.entity"
import { UserStatus } from "../enums/user-status.enum"

export class UserResponseDto extends BaseEntity {
    email: string
    fullName: string
    avatarUrl?: string
    status: UserStatus
}
