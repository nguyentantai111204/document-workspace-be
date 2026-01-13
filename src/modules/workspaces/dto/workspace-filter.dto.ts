import { IsOptional, IsEnum, IsString } from 'class-validator'
import { QueryDto } from 'src/common/dto/query.dto'
import { WorkspaceSortField } from '../enums/workspace-sort-field.enum'
import { SortOrder } from 'src/common/enums/sort.enum'

export class WorkspaceQueryDto extends QueryDto<WorkspaceSortField> {
    @IsOptional()
    @IsString()
    search?: string

    @IsOptional()
    @IsEnum(WorkspaceSortField)
    sortBy: WorkspaceSortField = WorkspaceSortField.CREATED_AT

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder: 'ASC' | 'DESC' = 'DESC'
}
