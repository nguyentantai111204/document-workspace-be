import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Repository } from 'typeorm';
import { AppointmentStatus } from '../enums/appointment.enum';
import { CreateAppointment } from '../interfaces/appointment.interface';

@Injectable()
export class AppointmentRepository {
    constructor(
        @InjectRepository(Appointment)
        private readonly repo: Repository<Appointment>,
    ) { }

    createAppointment(data: CreateAppointment) {
        return this.repo.save(this.repo.create({
            ...data,
            status: AppointmentStatus.SCHEDULED,
            updatedBy: data.createdBy,
        }));
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    findByIdWithDetails(id: string) {
        return this.repo.findOne({
            where: { id },
        }); // Need to check if there are explicit relations to participants/reminders in entity
    }

    updateStatus(id: string, status: AppointmentStatus) {
        return this.repo.update(id, { status });
    }

    async getAppointmentsByDateRange(workspaceId: string, userId: string, startDate: Date, endDate: Date) {
        return this.repo
            .createQueryBuilder('appointment')
            .where('appointment.workspaceId = :workspaceId', { workspaceId })
            .andWhere('appointment.createdBy = :userId', { userId })
            .andWhere('appointment.startTime >= :startDate', { startDate })
            .andWhere('appointment.startTime <= :endDate', { endDate })
            .orderBy('appointment.startTime', 'ASC')
            .getMany();
    }

    update(id: string, data: Partial<Appointment>) {
        return this.repo.update(id, data);
    }

    remove(id: string) {
        return this.repo.delete(id);
    }
}
