import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceMemberService } from '../services/workspace-member.service';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { WorkspaceGuard } from 'src/common/guards/workspace.guard';
import { WorkspacePolicyGuard } from 'src/common/guards/workspace-action.guard';
import { WorkspaceActionPermission } from 'src/common/decorators/workspace-action.decorator';

import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { WorkspaceQueryDto } from '../dto/workspace-filter.dto';
import { ListMembersQueryDto } from '../dto/workspace-member-filter.dto';
import { WorkspaceAction } from '../enums/workspace-action.enum';
import { WorkspaceInviteService } from '../services/workspace-invite.service';
import { AcceptInviteDto } from '../dto/accept-invite.dto';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionCode } from 'src/modules/permission/enums/permission-code.enum';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('workspaces')
export class WorkspaceController {
    constructor(
        private readonly workspaceService: WorkspaceService,
        private readonly memberService: WorkspaceMemberService,
        private readonly inviteService: WorkspaceInviteService,
    ) { }

    @Post()
    @Permissions(PermissionCode.WORKSPACE_CREATE)
    @ApiOperation({ summary: 'Tạo workspace mới' })
    @ApiBody({ type: CreateWorkspaceDto })
    @ApiResponse({ status: 201, description: 'Tạo workspace thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    create(
        @CurrentUser() user,
        @Body() dto: CreateWorkspaceDto,
    ) {
        return this.workspaceService.createWorkspace(user.id, dto.name);
    }

    @Get()
    @Permissions(PermissionCode.WORKSPACE_READ)
    @ApiOperation({ summary: 'Lấy danh sách workspace của user' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Danh sách workspace của user' })
    list(
        @CurrentUser() user,
        @Query() query: WorkspaceQueryDto,
    ) {
        return this.workspaceService.listUserWorkspaces(user.id, query);
    }

    @UseGuards(WorkspaceGuard)
    @Get(':workspaceId')
    @Permissions(PermissionCode.WORKSPACE_READ)
    @ApiOperation({ summary: 'Lấy thông tin chi tiết workspace' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiResponse({ status: 200, description: 'Thông tin workspace' })
    @ApiResponse({ status: 403, description: 'Không có quyền truy cập workspace' })
    getDetail(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser() user,
    ) {
        return this.workspaceService.getWorkspaceDetail(workspaceId, user.id);
    }

    // ... (commented out code omitted)

    @UseGuards(WorkspaceGuard)
    @Get(':workspaceId/members')
    @Permissions(PermissionCode.WORKSPACE_READ)
    @ApiOperation({ summary: 'Lấy danh sách thành viên trong workspace' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Danh sách thành viên' })
    listMembers(
        @Param('workspaceId') workspaceId: string,
        @Query() query: ListMembersQueryDto,
    ) {
        return this.memberService.listMembers(workspaceId, query);
    }

    @Patch(':workspaceId/members/role')
    @UseGuards(WorkspaceGuard, WorkspacePolicyGuard)
    @WorkspaceActionPermission(WorkspaceAction.UPDATE_MEMBER_ROLE)
    @Permissions(PermissionCode.WORKSPACE_UPDATE)
    updateRole(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser() user,
        @Body() dto: UpdateMemberRoleDto,
    ) {
        return this.memberService.updateMemberRole(
            workspaceId,
            user.id,
            dto.userId,
            dto.role,
        )
    }

    @Patch(':workspaceId')
    @UseGuards(WorkspaceGuard)
    @Permissions(PermissionCode.WORKSPACE_UPDATE)
    updateWorkspace(
        @Param('workspaceId') workspaceId: string,
        @Body() dto: UpdateWorkspaceDto,
    ) {
        return this.workspaceService.updateWorkspace(workspaceId, dto.name);
    }

}
