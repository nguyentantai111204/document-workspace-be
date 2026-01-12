import { IsOptional, IsString } from 'class-validator'
import { QueryDto } from 'src/common/dto/query.dto'
import { WorkspaceSortField } from '../enums/workspace-sort-field.enum'

export class WorkspaceQueryDto extends QueryDto<WorkspaceSortField> {
    @IsOptional()
    @IsString()
    keyword?: string
}
