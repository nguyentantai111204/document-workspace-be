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

    async createAppointment(data: CreateAppointment): Promise<Appointment> {
        const appointment = this.repo.create({
            workspaceId: data.workspaceId,
            title: data.title,
            description: data.description,
            startTime: data.startTime,
            endTime: data.endTime,
            status: AppointmentStatus.SCHEDULED,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        });
        return this.repo.save(appointment);
    }
}