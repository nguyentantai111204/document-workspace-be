import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { WorkspaceService } from '../services/workspace.service'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { WorkspaceGuard } from 'src/common/guards/workspace.guard'
import { CreateWorkspaceDto } from '../dto/create-workspace.dto'
import { InviteMemberDto } from '../dto/invite-member.dto'
import { WorkspaceMemberService } from '../services/workspace-member.service'
import { WorkspaceAction } from '../enums/workspace-action.enum'
import { WorkspacePolicyGuard } from 'src/common/guards/workspace-action.guard'
import { WorkspaceActionPermission } from 'src/common/decorators/workspace-action.decorator'

@UseGuards(AuthGuard('jwt'))
@Controller('workspaces')
export class WorkspaceController {
    constructor(
        private readonly workspaceService: WorkspaceService,
        private readonly memberService: WorkspaceMemberService,
    ) { }

    @Post()
    create(
        @CurrentUser() user,
        @Body() dto: CreateWorkspaceDto,
    ) {
        return this.workspaceService.createWorkspace(user.id, dto.name)
    }

    @UseGuards(WorkspaceGuard, WorkspacePolicyGuard)
    @Post(':workspaceId/members')
    @WorkspaceActionPermission(WorkspaceAction.INVITE_MEMBER)
    invite(
        @Param('workspaceId') workspaceId: string,
        @Body() dto: InviteMemberDto,
    ) {
        return this.memberService.addMember(
            workspaceId,
            dto.userId,
            dto.role,
        )
    }
}
