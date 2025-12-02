import * as v from 'valibot'

export const PaginationSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 10),
})

export type PaginationInput = v.InferInput<typeof PaginationSchema>

export const getInitialPaginationValues = (): PaginationInput => {
  return { page: 1, pageSize: 10 }
}
