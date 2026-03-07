import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto, GetAppointmentsDto } from '../dto/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { buildPaginationMeta } from 'src/common/utils/pagination.utils';
import { NotFoundException } from '@nestjs/common';
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
        const { page = 1, limit = 20 } = dto;
        const { data, total } = await this.appointmentRepo.getAppointmentByWorkspaceAndUserId(
            workspaceId,
            userId,
            page,
            limit
        );

        return {
            items: data,
            meta: buildPaginationMeta(page, limit, total)
        };
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

    async deleteAppointment(workspaceId: string, id: string, userId: string): Promise<void> {
        const appointment = await this.appointmentRepo.findById(id);

        if (!appointment || appointment.workspaceId !== workspaceId) {
            throw new NotFoundException('Không tìm thấy cuộc hẹn');
        }

        // Tùy theo logic nghiệp vụ, có thể chỉ cho allow host/creator xóa, hoặc admin
        // if (appointment.createdBy !== userId) {
        //     throw new ForbiddenException('Bạn không có quyền xóa cuộc hẹn này');
        // }

        await this.scheduleService.cancelAll(id);

        await this.appointmentRepo.remove(id);

        // Optional: Send cancellation notification
        // await this.notificationService.notifyParticipantsOnCancel(appointment, ...)
    }
}
