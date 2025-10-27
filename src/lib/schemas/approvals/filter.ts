import dayjs from 'dayjs'
import * as v from 'valibot'

export const ApprovalsFilterSchema = v.pipe(
  v.object({
    date_from: v.pipe(v.optional(v.string())),
    date_to: v.pipe(v.optional(v.string())),
    store_id: v.pipe(v.optional(v.string())),
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

export type ApprovalsFilterForm = v.InferInput<typeof ApprovalsFilterSchema>
