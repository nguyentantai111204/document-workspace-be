import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDto } from '../dto/appointment.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { WorkspaceGuard } from 'src/common/guards/workspace.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionCode } from 'src/modules/permission/enums/permission-code.enum';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('workspaces/:workspaceId/appointments')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Post()
    @UseGuards(WorkspaceGuard)
    @Permissions(PermissionCode.APPOINTMENT_CREATE)
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
}