import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { MessageAttachment } from '../entities/message.entity'

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttachmentDto)
    attachments?: AttachmentDto[]
}

export class AttachmentDto implements MessageAttachment {
    @IsString()
    type: 'image' | 'file' | 'video' | 'audio'

    @IsString()
    url: string

    @IsString()
    name: string

    @IsNotEmpty()
    size: number

    @IsString()
    mimeType: string
}
