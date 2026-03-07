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

    async createParticipants(data: CreateAppointmentParticipant[]): Promise<AppointmentParticipant[]> {
        const participants = this.repo.create(
            data.map((d) => ({
                appointmentId: d.appointmentId,
                userId: d.userId,
                role: d.role ?? AppointmentParticipantRole.PARTICIPANT,
                reminderEnabled: d.reminderEnabled ?? true,
            })),
        );
        return this.repo.save(participants);
    }

    async findByAppointmentId(appointmentId: string): Promise<AppointmentParticipant[]> {
        return this.repo.find({ where: { appointmentId } });
    }
}