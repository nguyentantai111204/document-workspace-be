import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentParticipant } from './entities/appointment-participant.entity';
import { AppointmentReminder } from './entities/appointment-reminder.entity';
import { AppointmentController } from './controllers/appointment.controller';
import { AppointmentService } from './services/appointment.service';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentParticipantRepository } from './repositories/appointment-participant.repository';
import { AppointmentReminderRepository } from './repositories/appointment-reminder.repository';
import { WorkspaceModule } from '../workspaces/workspace.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Appointment,
            AppointmentParticipant,
            AppointmentReminder,
        ]),
        WorkspaceModule,
        NotificationModule,
    ],
    controllers: [AppointmentController],
    providers: [
        AppointmentService,
        AppointmentRepository,
        AppointmentParticipantRepository,
        AppointmentReminderRepository,
    ],
    exports: [AppointmentService],
})
export class AppointmentModule { }