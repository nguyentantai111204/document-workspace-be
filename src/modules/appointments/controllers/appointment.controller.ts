import {
    Body,
    Controller,
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
    ApiTags,
} from '@nestjs/swagger';

import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDto } from '../dto/appointment.dto';
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
}