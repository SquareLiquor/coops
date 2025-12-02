import type { PaginationInput } from '$lib/schemas'
import type { PaginationResult } from '$lib/types'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

/**
 * Supabase 쿼리에 페이징을 체이닝 방식으로 적용하는 빌더
 */
export class PaginatedQueryBuilder<T = any> {
  private query: PostgrestFilterBuilder<any, any, Record<string, unknown>, any, any>
  private page: number
  private pageSize: number

  constructor(
    query: PostgrestFilterBuilder<any, any, Record<string, unknown>, any, any>,
    pagination?: PaginationInput
  ) {
    this.query = query
    this.page = pagination?.page ?? 1
    this.pageSize = pagination?.pageSize ?? 10
  }

  /**
   * 페이징이 적용된 쿼리를 실행하고 결과를 반환
   */
  async execute(): Promise<PaginationResult<T>> {
    const from = (this.page - 1) * this.pageSize
    const to = from + this.pageSize - 1

    const { data, error, count } = await this.query.range(from, to)

    if (error) throw error

    const totalCount = count ?? 0
    const totalPages = Math.ceil(totalCount / this.pageSize)

    return {
      data: (data as T[]) || [],
      pagination: {
        page: this.page,
        pageSize: this.pageSize,
        totalCount,
        totalPages,
      },
    }
  }
}

/**
 * Supabase 쿼리에 페이징을 체이닝 방식으로 적용
 * @example
 * const result = await paginate(
 *   query.order('created_at', { ascending: false }),
 *   { page: 1, pageSize: 10 }
 * ).execute()
 */
export const paginate = <T = any>(
  query: PostgrestFilterBuilder<any, any, Record<string, unknown>, any, any>,
  pagination?: PaginationInput
): PaginatedQueryBuilder<T> => {
  return new PaginatedQueryBuilder<T>(query, pagination)
}
