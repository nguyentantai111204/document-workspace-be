import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentParticipant } from '../entities/appointment-participant.entity';
import { Repository } from 'typeorm';
import { AppointmentParticipantResponseStatus, AppointmentParticipantRole } from '../enums/appointment-participant.enum';
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
                responseStatus: d.responseStatus ?? AppointmentParticipantResponseStatus.PENDING,
            })),
        ));
    }

    async findByAppointmentId(appointmentId: string) {
        const items = await this.repo
            .createQueryBuilder('participant')
            .innerJoin('users', 'u', 'u.id = participant.user_id')
            .where('participant.appointment_id = :appointmentId', { appointmentId })
            .select([
                'participant.id as "id"',
                'participant.created_at as "createdAt"',
                'participant.updated_at as "updatedAt"',
                'participant.deleted_at as "deletedAt"',
                'participant.appointment_id as "appointmentId"',
                'participant.user_id as "userId"',
                'participant.role as "role"',
                'participant.reminder_enabled as "reminderEnabled"',
                'participant.response_status as "responseStatus"',
                'u.full_name as "fullName"',
                'u.email as "email"',
                'u.avatar_url as "avatarUrl"',
            ])
            .getRawMany();

        return items;
    }

    findByAppointmentIdAndUserId(appointmentId: string, userId: string) {
        return this.repo.findOne({ where: { appointmentId, userId } });
    }

    updateResponseStatus(appointmentId: string, userId: string, status: AppointmentParticipantResponseStatus) {
        return this.repo.update({ appointmentId, userId }, { responseStatus: status });
    }

    deleteByAppointmentId(appointmentId: string) {
        return this.repo.delete({ appointmentId });
    }
}