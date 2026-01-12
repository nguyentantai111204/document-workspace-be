import { IsOptional, IsString } from 'class-validator'
import { QueryDto } from 'src/common/dto/query.dto'
import { FileSortField } from '../enums/file-sort-field.enum'

export class FileQueryDto extends QueryDto<FileSortField> {
    @IsOptional()
    @IsString()
    mimeType?: string

    @IsOptional()
    @IsString()
    ownerId?: string

    @IsOptional()
    @IsString()
    keyword?: string
}
