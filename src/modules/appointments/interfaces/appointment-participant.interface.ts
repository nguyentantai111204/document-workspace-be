import { AppointmentParticipantRole } from "../enums/appointment-participant.enum";

export interface CreateAppointmentParticipant {
    appointmentId: string;
    userId: string;
    role?: AppointmentParticipantRole;
    reminderEnabled?: boolean;
}