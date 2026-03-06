import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AppointmentParticipantRepository } from '../repositories/appointment-participant.repository';
import { AppointmentReminderRepository } from '../repositories/appointment-reminder.repository';
import { CreateAppointmentDto } from '../dto/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentParticipantRole } from '../enums/appointment-participant.enum';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { NotificationType } from 'src/modules/notifications/enums/notification-type.enum';

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepo: AppointmentRepository,
        private readonly participantRepo: AppointmentParticipantRepository,
        private readonly reminderRepo: AppointmentReminderRepository,
        private readonly notificationService: NotificationService,
    ) { }

    async createAppointment(
        dto: CreateAppointmentDto,
        creatorId: string,
        workspaceId: string,
    ) {
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
        if (dto.reminder) {
            await this.reminderRepo.createReminders([{
                appointmentId: appointment.id,
                startTime: appointment.startTime,
                minutesBefore: dto.reminder.minutesBefore,
                targetMode: dto.reminder.targetMode,
            }]);
        }

        if (participantUserIds.size > 0) {
            for (const participant of participantsToCreate) {
                if (participant.userId !== creatorId) {
                    await this.notificationService.create({
                        recipientId: participant.userId,
                        senderId: creatorId,
                        type: NotificationType.APPOINTMENT,
                        title: 'Lời mời tham gia cuộc hẹn',
                        body: `${creatorId} đã mời bạn tham gia cuộc hẹn "${appointment.title}"`,
                        data: {
                            appointmentId: appointment.id,
                            appointmentTitle: appointment.title,
                            inviterName: creatorId,
                        }
                    });
                }
            }
        }

        return appointment;
    }
}