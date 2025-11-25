import * as v from 'valibot'

export const ApprovalSchema = v.pipe(
  v.object({
    id: v.string(),
    userId: v.string(),
    storeId: v.string(),
  })
)

export type ApprovalForm = v.InferInput<typeof ApprovalSchema>
