import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { NotificationType } from "../enums/notification-type.enum"

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    recipientId: string

    @IsOptional()
    @IsString()
    senderId?: string

    @IsEnum(NotificationType)
    type: NotificationType

    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    body: string

    @IsOptional()
    data?: any
}
