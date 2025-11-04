import dayjs from 'dayjs'
import * as v from 'valibot'

export const ProductsFilterSchema = v.pipe(
  v.object({
    store_id: v.string(),
    date_from: v.pipe(v.optional(v.string())),
    date_to: v.pipe(v.optional(v.string())),
    category_id: v.pipe(v.optional(v.string())),
    product_name: v.pipe(v.optional(v.string())),
    status: v.pipe(v.optional(v.string())),
    // pagination: v.optional(v.object({
    //   page: v.number().min(1).default(1),
    //   pageSize: v.number().min(1).default(10),
    // })),
  }),
  v.forward(
    v.partialCheck(
      [['date_from'], ['date_to']],
      (input) => {
        if (!input.date_from || !input.date_to) return true

        const dateFrom = dayjs(input.date_from)
        const dateTo = dayjs(input.date_to)

        return dateFrom && dateTo && dateFrom.isBefore(dateTo)
      },
      '검색 시작일은 검색 종료일 이전이어야 합니다.'
    ),
    ['date_from']
  )
)

export type ProductsFilterForm = v.InferInput<typeof ProductsFilterSchema>

export const getInitialProductsFilterValues = (store_id: string | undefined) => {
  if (!store_id) return {}

  return { store_id }
}
