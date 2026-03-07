import { Injectable } from '@nestjs/common';
import { AppointmentReminderRepository } from '../repositories/appointment-reminder.repository';
import { AppointmentReminder } from '../entities/appointment-reminder.entity';
import { CreateAppointmentReminderDto } from '../dto/appointment.dto';

@Injectable()
export class AppointmentReminderService {
    constructor(
        private readonly reminderRepo: AppointmentReminderRepository,
    ) { }


    async createForAppointment(
        appointmentId: string,
        startTime: Date,
        reminderDto?: CreateAppointmentReminderDto,
    ): Promise<AppointmentReminder[]> {
        if (!reminderDto) return [];

        return this.reminderRepo.createReminders([{
            appointmentId,
            startTime,
            minutesBefore: reminderDto.minutesBefore,
            targetMode: reminderDto.targetMode,
        }]);
    }
}
