import dayjs from 'dayjs'
import * as v from 'valibot'
import { PaginationSchema } from '../common/pagination.schema'

export const CoopsFilterSchema = v.pipe(
  v.object({
    storeId: v.string(),
    dateFrom: v.pipe(v.optional(v.string())),
    dateTo: v.pipe(v.optional(v.string())),
    categoryId: v.pipe(v.optional(v.string())),
    name: v.pipe(v.optional(v.string())),
    status: v.pipe(v.optional(v.string())),
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

export const ConsumerCoopsFilterSchema = v.pipe(
  v.object({
    storeId: v.string(),
    categoryId: v.pipe(v.optional(v.string())),
    dateAt: v.pipe(v.optional(v.string())),
  })
)

export type CoopsFilterInput = v.InferInput<typeof CoopsFilterSchema>
export type ConsumerCoopsFilterSchema = v.InferInput<typeof ConsumerCoopsFilterSchema>

export const getInitialCoopsFilterValues = (storeId: string) => {
  return { storeId }
}
