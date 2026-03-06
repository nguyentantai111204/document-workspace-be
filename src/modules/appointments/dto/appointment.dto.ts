import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, ArrayNotEmpty, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentReminderTargetMode, MinutesBefore } from '../enums/appointment-remider.enum';

export class CreateAppointmentParticipantDto {
    @IsUUID()
    userId: string;
}

export class CreateAppointmentReminderDto {
    @IsEnum(MinutesBefore)
    minutesBefore: MinutesBefore;

    @IsEnum(AppointmentReminderTargetMode)
    targetMode: AppointmentReminderTargetMode;
}

export class CreateAppointmentDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDate()
    @Type(() => Date)
    startTime: Date;

    @IsDate()
    @Type(() => Date)
    endTime: Date;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateAppointmentParticipantDto)
    participants: CreateAppointmentParticipantDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAppointmentReminderDto)
    reminders?: CreateAppointmentReminderDto[];
}