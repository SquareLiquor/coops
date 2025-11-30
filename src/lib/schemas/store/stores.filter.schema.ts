import * as v from 'valibot'
import { PaginationSchema } from '../common/pagination.schema'

export const StoresFilterSchema = v.object({
  storeName: v.pipe(v.optional(v.string())),
  type: v.pipe(v.optional(v.string())),
  ...PaginationSchema.entries,
})

export type StoresFilterInput = v.InferInput<typeof StoresFilterSchema>

export const getInitialStoresFilterValues = (): StoresFilterInput => ({
  storeName: undefined,
  type: 'all',
})
