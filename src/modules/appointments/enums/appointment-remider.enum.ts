export enum AppointmentReminderTargetMode {
    ALL_PARTICIPANTS = 'all_participants',
    SELECTED_PARTICIPANTS = 'selected_participants',
}


export enum AppointmentNotificationEvent {
    REMIND = 'remind',
    START = 'start',
    END = 'end',
}

export enum MinutesBefore {
    MINUTES_5 = 5,
    MINUTES_10 = 10,
    MINUTES_15 = 15,
    MINUTES_30 = 30,
    MINUTES_60 = 60,
}
