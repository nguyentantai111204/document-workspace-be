import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { NotificationType } from 'src/modules/notifications/enums/notification-type.enum';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentParticipant } from '../entities/appointment-participant.entity';
import { AppointmentParticipantRole } from '../enums/appointment-participant.enum';
import { AppointmentReminder } from '../entities/appointment-reminder.entity';
import { AppointmentParticipantRepository } from '../repositories/appointment-participant.repository';
import { AppointmentNotificationEvent } from '../enums/appointment-remider.enum';

@Injectable()
export class AppointmentNotificationService {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly participantRepo: AppointmentParticipantRepository,
    ) { }

    async notifyParticipantsOnCreate(
        appointment: Appointment,
        participants: AppointmentParticipant[],
        creatorId: string,
    ): Promise<void> {
        const recipients = participants.filter(
            (p) => p.userId !== creatorId && p.role !== AppointmentParticipantRole.HOST,
        );

        for (const participant of recipients) {
            await this.notificationService.create({
                recipientId: participant.userId,
                senderId: creatorId,
                type: NotificationType.APPOINTMENT,
                title: 'Lời mời tham gia cuộc hẹn',
                body: `Bạn đã được mời tham gia cuộc hẹn "${appointment.title}"`,
                data: {
                    appointmentId: appointment.id,
                    appointmentTitle: appointment.title, 
                    inviterId: creatorId,
                },
            });
        }
    }

    async sendEventNotifications(
        appointment: Appointment,
        event: AppointmentNotificationEvent,
        reminder?: AppointmentReminder,
    ): Promise<void> {
        const participants = await this.participantRepo.findByAppointmentId(appointment.id);
        const recipients = participants.filter((p) => p.reminderEnabled);
        const { title, body } = this.buildPayload(appointment, event, reminder);

        for (const participant of recipients) {
            await this.notificationService.create({
                recipientId: participant.userId,
                senderId: appointment.createdBy,
                type: NotificationType.APPOINTMENT,
                title,
                body,
                data: {
                    appointmentId: appointment.id,
                    appointmentTitle: appointment.title,
                    event,
                },
            });
        }
    }

    private buildPayload(
        appointment: Appointment,
        event: AppointmentNotificationEvent,
        reminder?: AppointmentReminder,
    ) {
        switch (event) {
            case AppointmentNotificationEvent.REMIND:
                return {
                    title: 'Nhắc nhở cuộc hẹn',
                    body: `Cuộc hẹn "${appointment.title}" sẽ bắt đầu sau ${reminder?.minutesBefore ?? '?'} phút`,
                };
            case AppointmentNotificationEvent.START:
                return {
                    title: 'Cuộc hẹn đã bắt đầu',
                    body: `Cuộc hẹn "${appointment.title}" đã bắt đầu`,
                };
            case AppointmentNotificationEvent.END:
                return {
                    title: 'Cuộc hẹn đã kết thúc',
                    body: `Cuộc hẹn "${appointment.title}" đã kết thúc`,
                };
        }
    }
}
