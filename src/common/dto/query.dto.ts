import { PaginationDto } from './pagination.dto'
import { SortDto, SortOrder } from './sort.dto'

export class QueryDto<TSort extends string = string>
    extends PaginationDto
    implements SortDto<TSort> {
    sortBy?: TSort
    sortOrder?: SortOrder
}
