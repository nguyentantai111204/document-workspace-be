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

    updateStatus(id: string, status: AppointmentStatus) {
        return this.repo.update(id, { status });
    }
}
