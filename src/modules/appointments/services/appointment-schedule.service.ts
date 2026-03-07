import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { AppointmentReminderRepository } from '../repositories/appointment-reminder.repository';
import { Appointment } from '../entities/appointment.entity';
import { APPOINTMENT_QUEUE, AppointmentJob } from '../constant/appointment.constant';

@Injectable()
export class AppointmentScheduleService {
    constructor(
        @InjectQueue(APPOINTMENT_QUEUE) private readonly queue: Queue,
        private readonly reminderRepo: AppointmentReminderRepository,
    ) { }

    async scheduleAll(appointment: Appointment): Promise<void> {
        await Promise.all([
            this.scheduleReminders(appointment),
            this.scheduleStatusJobs(appointment),
        ]);
    }

    private async scheduleReminders(appointment: Appointment): Promise<void> {
        const reminders = await this.reminderRepo.findByAppointmentId(appointment.id);

        for (const reminder of reminders) {
            const delay = reminder.reminderTime.getTime() - Date.now();
            if (delay > 0) {
                await this.queue.add(
                    AppointmentJob.REMIND,
                    {
                        appointmentId: appointment.id,
                        reminderId: reminder.id,
                    },
                    { delay },
                );
            }
        }
    }

    private async scheduleStatusJobs(appointment: Appointment): Promise<void> {
        const startDelay = appointment.startTime.getTime() - Date.now();
        const endDelay = appointment.endTime.getTime() - Date.now();

        if (startDelay > 0) {
            await this.queue.add(
                AppointmentJob.START,
                { appointmentId: appointment.id },
                { delay: startDelay },
            );
        }

        if (endDelay > 0) {
            await this.queue.add(
                AppointmentJob.END,
                { appointmentId: appointment.id },
                { delay: endDelay },
            );
        }
    }
}