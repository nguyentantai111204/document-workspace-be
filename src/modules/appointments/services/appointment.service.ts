import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AppointmentParticipantRepository } from '../repositories/appointment-participant.repository';
import { AppointmentReminderRepository } from '../repositories/appointment-reminder.repository';
import { CreateAppointmentDto } from '../dto/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentParticipantRole } from '../enums/appointment-participant.enum';

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepo: AppointmentRepository,
        private readonly participantRepo: AppointmentParticipantRepository,
        private readonly reminderRepo: AppointmentReminderRepository,
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

        // Add host + participants
        const participantUserIds = new Set(dto.participants.map((p) => p.userId));
        const participantsToCreate = [
            { appointmentId: appointment.id, userId: creatorId, role: AppointmentParticipantRole.HOST },
            ...[...participantUserIds]
                .filter((uid) => uid !== creatorId)
                .map((uid) => ({
                    appointmentId: appointment.id,
                    userId: uid,
                    role: AppointmentParticipantRole.PARTICIPANT,
                })),
        ];

        await this.participantRepo.createParticipants(participantsToCreate);

        // Create reminders
        if (dto.reminders?.length) {
            await this.reminderRepo.createReminders(
                dto.reminders.map((r) => ({
                    appointmentId: appointment.id,
                    startTime: appointment.startTime,
                    minutesBefore: r.minutesBefore,
                    targetMode: r.targetMode,
                })),
            );
        }

        return appointment;
    }
}