// Generic paginated-response envelope returned by list endpoints across domains.
export interface Page<T> {
    items: T[]
    total: number
    page: number
    size: number
}
