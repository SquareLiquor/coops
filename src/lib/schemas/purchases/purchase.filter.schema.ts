import dayjs from 'dayjs'
import * as v from 'valibot'
import { PaginationSchema } from '../common/pagination.schema'

export const PurchasesFilterSchema = v.pipe(
  v.object({
    storeId: v.pipe(v.optional(v.string())),
    categoryId: v.pipe(v.optional(v.string())),
    status: v.pipe(v.optional(v.string())),
    dateFrom: v.pipe(v.optional(v.string())),
    dateTo: v.pipe(v.optional(v.string())),
    ...PaginationSchema.entries,
  }),
  v.forward(
    v.partialCheck(
      [['dateFrom'], ['dateTo']],
      (input) => {
        if (!input.dateFrom || !input.dateTo) return true

        const dateFrom = dayjs(input.dateFrom)
        const dateTo = dayjs(input.dateTo)

        return dateFrom && dateTo && dateFrom.isBefore(dateTo)
      },
      '검색 시작일은 검색 종료일 이전이어야 합니다.'
    ),
    ['dateFrom']
  )
)

export type PurchasesFilterInput = v.InferInput<typeof PurchasesFilterSchema>

export const getInitialPurchasesFilterValues = (storeId: string) => {
  return {
    storeId,
  }
}
