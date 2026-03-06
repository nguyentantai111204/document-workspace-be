export interface CreateAppointment {
    workspaceId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    createdBy: string;
}
