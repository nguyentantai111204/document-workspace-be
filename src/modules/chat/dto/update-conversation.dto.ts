import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateConversationDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string

    @IsOptional()
    @IsString()
    avatarUrl?: string
}
