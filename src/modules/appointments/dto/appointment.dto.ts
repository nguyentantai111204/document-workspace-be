import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, ArrayNotEmpty, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentReminderTargetMode, MinutesBefore } from '../enums/appointment-remider.enum';
import { PartialType } from '@nestjs/swagger';

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

    @IsOptional()
    @IsString()
    url?: string;

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
    @ValidateNested()
    @Type(() => CreateAppointmentReminderDto)
    reminder?: CreateAppointmentReminderDto;
}

export class GetAppointmentsDto {
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    endDate: Date;
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) { }