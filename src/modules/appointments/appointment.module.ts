import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Appointment } from './entities/appointment.entity';
import { AppointmentParticipant } from './entities/appointment-participant.entity';
import { AppointmentReminder } from './entities/appointment-reminder.entity';
import { AppointmentController } from './controllers/appointment.controller';
import { AppointmentService } from './services/appointment.service';
import { AppointmentParticipantService } from './services/appointment-participant.service';
import { AppointmentReminderService } from './services/appointment-reminder.service';
import { AppointmentNotificationService } from './services/appointment-notification.service';
import { AppointmentScheduleService } from './services/appointment-schedule.service';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentParticipantRepository } from './repositories/appointment-participant.repository';
import { AppointmentReminderRepository } from './repositories/appointment-reminder.repository';
import { AppointmentProcessor } from './processors/appointment.processor';
import { WorkspaceModule } from '../workspaces/workspace.module';
import { NotificationModule } from '../notifications/notification.module';
import { APPOINTMENT_QUEUE } from './constant/appointment.constant';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Appointment,
            AppointmentParticipant,
            AppointmentReminder,
        ]),
        BullModule.registerQueue({
            name: APPOINTMENT_QUEUE,
        }),
        WorkspaceModule,
        NotificationModule,
    ],
    controllers: [AppointmentController],
    providers: [
        AppointmentRepository,
        AppointmentParticipantRepository,
        AppointmentReminderRepository,

        AppointmentService,
        AppointmentParticipantService,
        AppointmentReminderService,
        AppointmentNotificationService,
        AppointmentScheduleService,

        AppointmentProcessor,
    ],
    exports: [AppointmentService],
})
export class AppointmentModule { }