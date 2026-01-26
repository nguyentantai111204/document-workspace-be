import { PaginationDto } from './pagination.dto'
import type { SortDto, SortOrder } from './sort.dto'
import { IsOptional, IsEnum, IsString } from 'class-validator'


export class QueryDto<TSort extends string = string>
    extends PaginationDto
    implements SortDto<TSort> {
    @IsOptional()
    @IsString()
    sortBy?: TSort

    @IsOptional()
    @IsEnum(['ASC', 'DESC'] as const)
    sortOrder?: SortOrder
}
