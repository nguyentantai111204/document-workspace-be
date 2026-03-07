import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto } from '../dto/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentParticipantService } from './appointment-participant.service';
import { AppointmentReminderService } from './appointment-reminder.service';
import { AppointmentNotificationService } from './appointment-notification.service';
import { AppointmentScheduleService } from './appointment-schedule.service';

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepo: AppointmentRepository,
        private readonly participantService: AppointmentParticipantService,
        private readonly reminderService: AppointmentReminderService,
        private readonly notificationService: AppointmentNotificationService,
        private readonly scheduleService: AppointmentScheduleService,
    ) { }

    async createAppointment(
        dto: CreateAppointmentDto,
        creatorId: string,
        workspaceId: string,
    ): Promise<Appointment> {
        const appointment = await this.appointmentRepo.createAppointment({
            workspaceId,
            title: dto.title,
            description: dto.description,
            startTime: dto.startTime,
            endTime: dto.endTime,
            createdBy: creatorId,
        });

        const participants = await this.participantService.createForAppointment(
            appointment.id,
            creatorId,
            dto.participants,
        );

        await this.reminderService.createForAppointment(
            appointment.id,
            appointment.startTime,
            dto.reminder,
        );

        await Promise.all([
            this.notificationService.notifyParticipantsOnCreate(appointment, participants, creatorId),
            this.scheduleService.scheduleAll(appointment),
        ]);

        return appointment;
    }
}
