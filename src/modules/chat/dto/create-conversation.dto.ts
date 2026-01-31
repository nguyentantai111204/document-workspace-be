import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, MaxLength } from 'class-validator'
import { ConversationType } from '../enums/conversation-type.enum'

export class CreateConversationDto {
    @IsEnum(ConversationType)
    @IsNotEmpty()
    type: ConversationType

    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    participantIds: string[]
}
