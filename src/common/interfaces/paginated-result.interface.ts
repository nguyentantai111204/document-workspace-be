export interface PaginatedResponse<T> {
    items: T[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}
