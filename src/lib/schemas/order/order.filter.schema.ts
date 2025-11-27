import dayjs from 'dayjs'
import * as v from 'valibot'
import { PaginationSchema } from '../common/pagination.schema'

export const OrdersFilterSchema = v.pipe(
  v.object({
    storeId: v.string(),
    name: v.pipe(v.optional(v.string())),
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

export const ConsumerOrdersFilterSchema = v.pipe(
  v.object({
    userId: v.string(),
    status: v.pipe(v.optional(v.string())),
    dateAt: v.pipe(v.optional(v.string())),
  })
)

export type OrdersFilterInput = v.InferInput<typeof OrdersFilterSchema>
export type ConsumerOrdersFilterInput = v.InferInput<typeof ConsumerOrdersFilterSchema>

export const getInitialOrdersFilterValues = (storeId: string) => {
  return { storeId }
}
