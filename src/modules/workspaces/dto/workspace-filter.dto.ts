import { IsOptional, IsEnum, IsString } from 'class-validator'
import { QueryDto } from 'src/common/dto/query.dto'
import { WorkspaceSortField } from '../enums/workspace-sort-field.enum'

export class WorkspaceQueryDto extends QueryDto<WorkspaceSortField> {
    @IsOptional()
    @IsString()
    keyword?: string

    @IsOptional()
    @IsEnum(WorkspaceSortField)
    sortBy: WorkspaceSortField = WorkspaceSortField.CREATED_AT

    @IsOptional()
    @IsEnum(['ASC', 'DESC'] as const)
    sortOrder: 'ASC' | 'DESC' = 'DESC'
}
