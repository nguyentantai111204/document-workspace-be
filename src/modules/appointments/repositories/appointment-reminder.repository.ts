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

    createReminders(data: CreateAppointmentReminder[]) {
        return this.repo.save(this.repo.create(
            data.map((d) => ({
                ...d,
                reminderTime: this.calcReminderTime(d.startTime, d.minutesBefore),
            })),
        ));
    }

    findByAppointmentId(appointmentId: string) {
        return this.repo.find({ where: { appointmentId } });
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    private calcReminderTime(startTime: Date, minutesBefore: number): Date {
        return new Date(startTime.getTime() - minutesBefore * 60 * 1000);
    }
}
