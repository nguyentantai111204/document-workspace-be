import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentReminder } from '../entities/appointment-reminder.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentReminder } from '../interfaces/appointment-remider.interface';

@Injectable()
export class AppointmentReminderRepository {
    constructor(
        @InjectRepository(AppointmentReminder)
        private readonly repo: Repository<AppointmentReminder>,
    ) { }

    async createReminders(data: CreateAppointmentReminder[]): Promise<AppointmentReminder[]> {
        const reminders = this.repo.create(
            data.map((d) => ({
                appointmentId: d.appointmentId,
                minutesBefore: d.minutesBefore,
                targetMode: d.targetMode,
                reminderTime: this.calcReminderTime(d.startTime, d.minutesBefore),
            })),
        );
        return this.repo.save(reminders);
    }

    async findByAppointmentId(appointmentId: string): Promise<AppointmentReminder[]> {
        return this.repo.find({ where: { appointmentId } });
    }

    async findById(id: string): Promise<AppointmentReminder | null> {
        return this.repo.findOne({ where: { id } });
    }

    private calcReminderTime(startTime: Date, minutesBefore: number): Date {
        return new Date(startTime.getTime() - minutesBefore * 60 * 1000);
    }
}
