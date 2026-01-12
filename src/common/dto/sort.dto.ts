import { IsEnum, IsOptional } from 'class-validator'

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class SortDto<T extends string = string> {
    @IsOptional()
    @IsEnum(Object)
    sortBy?: T

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC
}
