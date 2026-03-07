import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentParticipant } from '../entities/appointment-participant.entity';
import { Repository } from 'typeorm';
import { AppointmentParticipantRole } from '../enums/appointment-participant.enum';
import { CreateAppointmentParticipant } from '../interfaces/appointment-participant.interface';

@Injectable()
export class AppointmentParticipantRepository {
    constructor(
        @InjectRepository(AppointmentParticipant)
        private readonly repo: Repository<AppointmentParticipant>,
    ) { }

    createParticipants(data: CreateAppointmentParticipant[]) {
        return this.repo.save(this.repo.create(
            data.map((d) => ({
                ...d,
                role: d.role ?? AppointmentParticipantRole.PARTICIPANT,
                reminderEnabled: d.reminderEnabled ?? true,
            })),
        ));
    }

    findByAppointmentId(appointmentId: string) {
        return this.repo.find({ where: { appointmentId } });
    }
}