export type PaginationInput = {
  page: number
  pageSize: number
}

export type PaginationResult<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}
