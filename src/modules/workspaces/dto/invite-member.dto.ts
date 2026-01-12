import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { WorkspaceRole } from '../enums/workspace-role.enum'

export class InviteMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string   // tạm thời invite bằng userId

  @IsEnum(WorkspaceRole)
  role: WorkspaceRole
}
