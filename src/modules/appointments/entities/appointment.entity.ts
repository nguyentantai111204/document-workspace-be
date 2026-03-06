import { Column, Entity, Index } from "typeorm";
import { AppointmentStatus } from "../enums/appointment.enum";
import { BaseEntity } from "src/common/entities/base.entity";

@Entity('appointments')
export class Appointment extends BaseEntity {
    @Column({ name: 'workspace_id', type: 'uuid' })
    @Index()
    workspaceId: string

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title: string

    @Column({ name: 'description', type: 'text', nullable: true })
    description?: string

    @Column({ name: 'start_time', type: 'timestamp' })
    startTime: Date

    @Column({ name: 'end_time', type: 'timestamp' })
    endTime: Date

    @Column({ name: 'status', type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
    status: AppointmentStatus

    @Column({ name: 'created_by', type: 'uuid' })
    createdBy: string

    @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updatedBy?: string
}