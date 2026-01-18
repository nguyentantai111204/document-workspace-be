import { IsEmail, IsEnum } from 'class-validator'
import { WorkspaceRole } from '../enums/workspace-role.enum'

export class InviteMemberDto {
  @IsEmail()
  email: string

  @IsEnum(WorkspaceRole)
  role: WorkspaceRole
}
