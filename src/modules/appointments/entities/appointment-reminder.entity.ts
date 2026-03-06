import { Column, Entity, Index } from "typeorm";
import { AppointmentReminderTargetMode, MinutesBefore } from "../enums/appointment-remider.enum";
import { BaseEntity } from "src/common/entities/base.entity";

@Entity('appointment_reminders')
@Index(['appointmentId', 'minutesBefore'], { unique: true })
export class AppointmentReminder extends BaseEntity {
    @Column({ name: 'appointment_id', type: 'uuid' })
    @Index()
    appointmentId: string

    @Column({ name: 'reminder_time', type: 'timestamp' })
    reminderTime: Date

    @Column({ name: 'minutes_before', type: 'enum', enum: MinutesBefore })
    minutesBefore: MinutesBefore

    @Column({
        name: 'target_mode',
        type: 'enum',
        enum: AppointmentReminderTargetMode,
        default: AppointmentReminderTargetMode.ALL_PARTICIPANTS,
    })
    targetMode: AppointmentReminderTargetMode
}