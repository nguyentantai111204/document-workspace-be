import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class GetMessagesDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 50

    @IsOptional()
    @IsString()
    cursor?: string // lastMessageId for pagination
}
