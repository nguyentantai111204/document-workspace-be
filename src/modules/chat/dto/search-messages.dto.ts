import { IsOptional, Max, IsString, IsNotEmpty } from 'class-validator'
import { PaginationDto } from 'src/common/dtos/pagination.dto'

export class SearchMessagesDto extends PaginationDto {
    @IsString()
    @IsNotEmpty()
    q: string

    @IsOptional()
    @Max(100)
    limit?: number = 20
}
