import { IsOptional, Max, IsString } from 'class-validator'
import { PaginationDto } from 'src/common/dtos/pagination.dto'

export class ConversationQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string

    @IsOptional()
    @Max(100)
    limit?: number = 20
}
