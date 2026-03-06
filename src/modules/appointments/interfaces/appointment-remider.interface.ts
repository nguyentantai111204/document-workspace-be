import { AppointmentReminderTargetMode, MinutesBefore } from "../enums/appointment-remider.enum";

export interface CreateAppointmentReminder {
    appointmentId: string;
    startTime: Date;
    minutesBefore: MinutesBefore;
    targetMode: AppointmentReminderTargetMode;
}