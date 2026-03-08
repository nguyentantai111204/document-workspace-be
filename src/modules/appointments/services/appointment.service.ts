import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from '../dto/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AppointmentParticipantService } from './appointment-participant.service';
import { AppointmentReminderService } from './appointment-reminder.service';
import { AppointmentNotificationService } from './appointment-notification.service';
import { AppointmentScheduleService } from './appointment-schedule.service';

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepo: AppointmentRepository,
        private readonly participantService: AppointmentParticipantService,
        private readonly reminderService: AppointmentReminderService,
        private readonly notificationService: AppointmentNotificationService,
        private readonly scheduleService: AppointmentScheduleService,
    ) { }

    async createAppointment(
        dto: CreateAppointmentDto,
        creatorId: string,
        workspaceId: string,
    ): Promise<Appointment> {
        const appointment = await this.appointmentRepo.createAppointment({
            workspaceId,
            title: dto.title,
            description: dto.description,
            startTime: dto.startTime,
            endTime: dto.endTime,
            url: dto.url,
            createdBy: creatorId,
        });

        const participants = await this.participantService.createForAppointment(
            appointment.id,
            creatorId,
            dto.participants,
        );

        await this.reminderService.createForAppointment(
            appointment.id,
            appointment.startTime,
            dto.reminder,
        );

        await Promise.all([
            this.notificationService.notifyParticipantsOnCreate(appointment, participants, creatorId),
            this.scheduleService.scheduleAll(appointment),
        ]);

        return appointment;
    }

    async getAppointmentByWorkspaceAndUserId(workspaceId: string, userId: string, dto: GetAppointmentsDto) {
        const { startDate, endDate } = dto;
        const appointments = await this.appointmentRepo.getAppointmentsByDateRange(
            workspaceId,
            userId,
            startDate,
            endDate
        );

        const groupedData = appointments.reduce((acc, current) => {
            const dateStr = current.startTime.toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(current);
            return acc;
        }, {} as Record<string, Appointment[]>);

        return groupedData;
    }

    async getAppointmentById(workspaceId: string, id: string) {
        const appointment = await this.appointmentRepo.findByIdWithDetails(id);

        if (!appointment || appointment.workspaceId !== workspaceId) {
            throw new NotFoundException('Không tìm thấy cuộc hẹn');
        }

        const [participants, reminders] = await Promise.all([
            this.participantService.getParticipantsByAppointmentId(id),
            this.reminderService.getRemindersByAppointmentId(id),
        ]);

        return {
            ...appointment,
            participants,
            reminders,
        };
    }

    async updateAppointment(
        workspaceId: string,
        id: string,
        userId: string,
        dto: UpdateAppointmentDto
    ) {
        const appointment = await this.appointmentRepo.findById(id);

        if (!appointment || appointment.workspaceId !== workspaceId) {
            throw new NotFoundException('Không tìm thấy cuộc hẹn');
        }

        if (appointment.createdBy !== userId) {
            throw new ForbiddenException('Chỉ người tạo mới có quyền thao tác trên cuộc hẹn này');
        }

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
        if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
        if (dto.url !== undefined) updateData.url = dto.url;

        if (Object.keys(updateData).length > 0) {
            await this.appointmentRepo.update(id, updateData);
        }

        const updatedAppointment = await this.appointmentRepo.findById(id);

        if (dto.participants) {
            await this.participantService.deleteByAppointmentId(id);
            await this.participantService.createForAppointment(
                id,
                appointment.createdBy,
                dto.participants
            );
        }

        if ('reminder' in dto) {
            await this.reminderService.deleteByAppointmentId(id);
            if (dto.reminder) {
                await this.reminderService.createForAppointment(
                    id,
                    updatedAppointment!.startTime,
                    dto.reminder
                );
            }
        }

        await this.scheduleService.cancelAll(id);
        await this.scheduleService.scheduleAll(updatedAppointment!);

        return this.getAppointmentById(workspaceId, id);
    }

    async deleteAppointment(workspaceId: string, id: string, userId: string): Promise<void> {
        const appointment = await this.appointmentRepo.findById(id);

        if (!appointment || appointment.workspaceId !== workspaceId) {
            throw new NotFoundException('Không tìm thấy cuộc hẹn');
        }

        if (appointment.createdBy !== userId) {
            throw new ForbiddenException('Chỉ người tạo mới có quyền thao tác trên cuộc hẹn này');
        }

        await this.scheduleService.cancelAll(id);

        await this.appointmentRepo.remove(id);
    }
}
