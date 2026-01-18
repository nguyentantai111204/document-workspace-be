import { IsEnum, IsUUID } from 'class-validator'
import { WorkspaceRole } from '../enums/workspace-role.enum'

export class UpdateMemberRoleDto {
    @IsUUID()
    userId: string

    @IsEnum(WorkspaceRole)
    role: WorkspaceRole
}
