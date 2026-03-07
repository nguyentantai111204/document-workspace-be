import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Delete,
    UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { WorkspaceInviteService } from '../services/workspace-invite.service'
import { InviteMemberDto } from '../dto/invite-member.dto'
import { AcceptInviteDto } from '../dto/accept-invite.dto'

import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { WorkspaceGuard } from 'src/common/guards/workspace.guard'
import { WorkspacePolicyGuard } from 'src/common/guards/workspace-action.guard'
import { WorkspaceActionPermission } from 'src/common/decorators/workspace-action.decorator'
import { WorkspaceAction } from '../enums/workspace-action.enum'

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspaceInviteController {
    constructor(
        private readonly inviteService: WorkspaceInviteService,
    ) { }

    @Post(':workspaceId/invites')
    @UseGuards(WorkspaceGuard, WorkspacePolicyGuard)
    @WorkspaceActionPermission(WorkspaceAction.INVITE_MEMBER)
    invite(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser() user,
        @Body() dto: InviteMemberDto,
    ) {
        return this.inviteService.invite(
            workspaceId,
            user.id,
            dto.email,
            dto.role,
        )
    }

    @Post('invites/accept')
    accept(
        @Body() dto: AcceptInviteDto,
        @CurrentUser() user,
    ) {
        return this.inviteService.acceptInvite(dto.token, user.id)
    }

    @Get(':workspaceId/invites')
    @UseGuards(WorkspaceGuard, WorkspacePolicyGuard)
    @WorkspaceActionPermission(WorkspaceAction.INVITE_MEMBER)
    list(@Param('workspaceId') workspaceId: string) {
        return this.inviteService.listInvites(workspaceId)
    }

    @Delete(':workspaceId/invites/:inviteId')
    @UseGuards(WorkspaceGuard, WorkspacePolicyGuard)
    @WorkspaceActionPermission(WorkspaceAction.INVITE_MEMBER)
    revoke(@Param('inviteId') inviteId: string) {
        return this.inviteService.revokeInvite(inviteId)
    }
}
