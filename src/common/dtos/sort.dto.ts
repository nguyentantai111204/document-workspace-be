
export type SortOrder = 'ASC' | 'DESC'

export interface SortDto<TSort extends string = string> {
    sortBy?: TSort
    sortOrder?: SortOrder
}

