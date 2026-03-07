import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { APPOINTMENT_QUEUE, AppointmentJob } from '../constant/appointment.constant';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AppointmentReminderRepository } from '../repositories/appointment-reminder.repository';
import { AppointmentNotificationService, AppointmentNotificationEvent } from '../services/appointment-notification.service';
import { AppointmentStatus } from '../enums/appointment.enum';

interface AppointmentJobData {
    appointmentId: string;
    reminderId?: string;
}

@Processor(APPOINTMENT_QUEUE)
export class AppointmentProcessor {
    private readonly logger = new Logger(AppointmentProcessor.name);

    constructor(
        private readonly appointmentRepo: AppointmentRepository,
        private readonly reminderRepo: AppointmentReminderRepository,
        private readonly notificationService: AppointmentNotificationService,
    ) { }

    @Process(AppointmentJob.REMIND)
    async handleRemind(job: Job<AppointmentJobData>): Promise<void> {
        const { appointmentId, reminderId } = job.data;
        try {
            const [appointment, reminder] = await Promise.all([
                this.appointmentRepo.findById(appointmentId),
                reminderId ? this.reminderRepo.findById(reminderId) : null,
            ]);

            if (!appointment || !reminder) {
                this.logger.warn(`Reminder job skipped — appointment or reminder not found (jobId=${job.id})`);
                return;
            }

            await this.notificationService.sendEventNotifications(appointment, AppointmentNotificationEvent.REMIND, reminder);
            this.logger.log(`Sent reminders for appointment ${appointmentId}`);
        } catch (error) {
            this.logger.error(`Failed to process REMIND job ${job.id}:`, error);
        }
    }

    @Process(AppointmentJob.START)
    async handleStart(job: Job<AppointmentJobData>): Promise<void> {
        const { appointmentId } = job.data;
        try {
            const appointment = await this.appointmentRepo.findById(appointmentId);
            if (!appointment) {
                this.logger.warn(`START job skipped — appointment not found (jobId=${job.id})`);
                return;
            }

            await Promise.all([
                this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.ONGOING),
                this.notificationService.sendEventNotifications(appointment, AppointmentNotificationEvent.START),
            ]);
            this.logger.log(`Appointment ${appointmentId} → ONGOING + notifications sent`);
        } catch (error) {
            this.logger.error(`Failed to process START job ${job.id}:`, error);
        }
    }

    @Process(AppointmentJob.END)
    async handleEnd(job: Job<AppointmentJobData>): Promise<void> {
        const { appointmentId } = job.data;
        try {
            const appointment = await this.appointmentRepo.findById(appointmentId);
            if (!appointment) {
                this.logger.warn(`END job skipped — appointment not found (jobId=${job.id})`);
                return;
            }

            await Promise.all([
                this.appointmentRepo.updateStatus(appointmentId, AppointmentStatus.DONE),
                this.notificationService.sendEventNotifications(appointment, AppointmentNotificationEvent.END),
            ]);
            this.logger.log(`Appointment ${appointmentId} → DONE + notifications sent`);
        } catch (error) {
            this.logger.error(`Failed to process END job ${job.id}:`, error);
        }
    }
}
