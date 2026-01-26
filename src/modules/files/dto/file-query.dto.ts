import { IsOptional, IsString, IsEnum } from 'class-validator'
import { QueryDto } from 'src/common/dtos/query.dto'
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
    search?: string

    @IsOptional()
    @IsEnum(FileSortField)
    sortBy?: FileSortField = FileSortField.CREATED_AT

    @IsOptional()
    @IsString()
    type?: string
}
