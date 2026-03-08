import {
    Body,
    Controller,
    Get,
    Delete,
    Param,
    ParseUUIDPipe,
    Post,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from '../dto/appointment.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { WorkspaceGuard } from 'src/common/guards/workspace.guard';
import { WorkspacePolicyGuard } from 'src/common/guards/workspace-action.guard';
import { WorkspaceActionPermission } from 'src/common/decorators/workspace-action.decorator';
import { WorkspaceAction } from 'src/modules/workspaces/enums/workspace-action.enum';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), WorkspaceGuard, WorkspacePolicyGuard)
@Controller('workspace/:workspaceId/appointments')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Post()
    @WorkspaceActionPermission(WorkspaceAction.APPOINTMENT_CREATE)
    @ApiOperation({ summary: 'Tạo cuộc hẹn mới trong workspace' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiBody({ type: CreateAppointmentDto })
    create(
        @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
        @CurrentUser() user,
        @Body() dto: CreateAppointmentDto,
    ) {
        return this.appointmentService.createAppointment(dto, user.id, workspaceId);
    }

    @Get()
    @WorkspaceActionPermission(WorkspaceAction.APPOINTMENT_READ)
    @ApiOperation({ summary: 'Lấy danh sách cuộc hẹn trong workspace' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    getAppointmentByWorkspaceAndUserId(
        @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
        @Query() query: GetAppointmentsDto,
        @CurrentUser() user,
    ) {
        return this.appointmentService.getAppointmentByWorkspaceAndUserId(workspaceId, user.id, query);
    }

    @Get(':id')
    @WorkspaceActionPermission(WorkspaceAction.APPOINTMENT_READ)
    @ApiOperation({ summary: 'Lấy chi tiết cuộc hẹn trong workspace' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiParam({ name: 'id', description: 'ID của cuộc hẹn' })
    getAppointmentById(
        @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.appointmentService.getAppointmentById(workspaceId, id);
    }

    @Patch(':id')
    @WorkspaceActionPermission(WorkspaceAction.APPOINTMENT_UPDATE)
    @ApiOperation({ summary: 'Cập nhật cuộc hẹn' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiParam({ name: 'id', description: 'ID của cuộc hẹn' })
    @ApiBody({ type: UpdateAppointmentDto })
    async updateAppointment(
        @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user,
        @Body() dto: UpdateAppointmentDto,
    ) {
        return this.appointmentService.updateAppointment(workspaceId, id, user.id, dto);
    }

    @Delete(':id')
    @WorkspaceActionPermission(WorkspaceAction.APPOINTMENT_DELETE)
    @ApiOperation({ summary: 'Xóa cuộc hẹn' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiParam({ name: 'id', description: 'ID của cuộc hẹn' })
    async deleteAppointment(
        @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user,
    ) {
        await this.appointmentService.deleteAppointment(workspaceId, id, user.id);
        return { message: 'Xóa cuộc hẹn thành công' };
    }

    @Post(':id/accept')
    @WorkspaceActionPermission(WorkspaceAction.APPOINTMENT_READ)
    @ApiOperation({ summary: 'Chấp nhận lời mời tham gia cuộc hẹn' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiParam({ name: 'id', description: 'ID của cuộc hẹn' })
    async acceptAppointment(
        @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user,
    ) {
        return this.appointmentService.acceptAppointment(workspaceId, id, user.id);
    }

    @Post(':id/reject')
    @WorkspaceActionPermission(WorkspaceAction.APPOINTMENT_READ)
    @ApiOperation({ summary: 'Từ chối lời mời tham gia cuộc hẹn' })
    @ApiParam({ name: 'workspaceId', description: 'ID của workspace' })
    @ApiParam({ name: 'id', description: 'ID của cuộc hẹn' })
    async rejectAppointment(
        @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user,
    ) {
        return this.appointmentService.rejectAppointment(workspaceId, id, user.id);
    }
}