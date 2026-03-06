import { Column, Entity, Index } from "typeorm";
import { AppointmentParticipantResponseStatus, AppointmentParticipantRole } from "../enums/appointment-participant.enum";
import { BaseEntity } from "src/common/entities/base.entity";

@Entity('appointment_participants')
@Index(['appointmentId', 'userId'])
export class AppointmentParticipant extends BaseEntity {
    @Column({ name: 'appointment_id', type: 'uuid' })
    @Index()
    appointmentId: string

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string

    @Column({ name: 'role', type: 'enum', enum: AppointmentParticipantRole, default: AppointmentParticipantRole.PARTICIPANT })
    role: AppointmentParticipantRole

    @Column({ name: 'reminder_enabled', type: 'boolean', default: true })
    reminderEnabled: boolean

    @Column({ name: 'response_status', type: 'enum', enum: AppointmentParticipantResponseStatus, default: AppointmentParticipantResponseStatus.PENDING })
    responseStatus: AppointmentParticipantResponseStatus
}