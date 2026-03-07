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

    async getAppointmentByWorkspaceAndUserId(workspaceId: string, userId: string, page: number, limit: number) {
        const [data, total] = await this.repo.findAndCount({
            where: { workspaceId, createdBy: userId },
            skip: (page - 1) * limit,
            take: limit,
            order: { startTime: 'DESC' }
        });

        return { data, total };
    }

    remove(id: string) {
        return this.repo.delete(id);
    }
}
