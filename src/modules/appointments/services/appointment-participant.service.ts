import { Injectable } from '@nestjs/common';
import { AppointmentParticipantRepository } from '../repositories/appointment-participant.repository';
import { AppointmentParticipant } from '../entities/appointment-participant.entity';
import { AppointmentParticipantRole } from '../enums/appointment-participant.enum';
import { CreateAppointmentParticipantDto } from '../dto/appointment.dto';

@Injectable()
export class AppointmentParticipantService {
    constructor(
        private readonly participantRepo: AppointmentParticipantRepository,
    ) { }

    async createForAppointment(
        appointmentId: string,
        creatorId: string,
        dtoParticipants: CreateAppointmentParticipantDto[],
    ): Promise<AppointmentParticipant[]> {
        const participantUserIds = new Set((dtoParticipants ?? []).map((p) => p.userId));

        const participantsToCreate = [
            {
                appointmentId,
                userId: creatorId,
                role: AppointmentParticipantRole.HOST,
            },
            ...[...participantUserIds]
                .filter((uid) => uid !== creatorId)
                .map((uid) => ({
                    appointmentId,
                    userId: uid,
                    role: AppointmentParticipantRole.PARTICIPANT,
                })),
        ];

        return this.participantRepo.createParticipants(participantsToCreate);
    }

    async getParticipantsByAppointmentId(appointmentId: string): Promise<AppointmentParticipant[]> {
        return this.participantRepo.findByAppointmentId(appointmentId);
    }
}
