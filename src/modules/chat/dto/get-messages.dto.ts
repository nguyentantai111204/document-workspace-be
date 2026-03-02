import { IsOptional, Max } from 'class-validator'
import { PaginationDto } from 'src/common/dtos/pagination.dto'

export class GetMessagesDto extends PaginationDto {
    @IsOptional()
    @Max(100)
    limit?: number = 50
}
