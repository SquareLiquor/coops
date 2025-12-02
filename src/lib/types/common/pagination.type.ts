export type Pagination = {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type PaginationResult<T> = {
  data: T[]
  pagination: Pagination
}
