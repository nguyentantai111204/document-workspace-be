export interface CreateAppointment {
    workspaceId: string;
    title: string;
    description?: string;
    url?: string;
    startTime: Date;
    endTime: Date;
    createdBy: string;
}
