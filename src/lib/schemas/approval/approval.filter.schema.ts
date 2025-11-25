import dayjs from 'dayjs'
import * as v from 'valibot'

export const ApprovalsFilterSchema = v.pipe(
  v.object({
    dateFrom: v.pipe(v.optional(v.string())),
    dateTo: v.pipe(v.optional(v.string())),
    storeId: v.pipe(v.optional(v.string())),
    status: v.pipe(v.optional(v.string())),
    // pagination: v.optional(v.object({
    //   page: v.number().min(1).default(1),
    //   pageSize: v.number().min(1).default(10),
    // })),
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

export type ApprovalsFilterForm = v.InferInput<typeof ApprovalsFilterSchema>
