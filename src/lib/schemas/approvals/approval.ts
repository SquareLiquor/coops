import * as v from 'valibot'

export const ApprovalSchema = v.pipe(
  v.object({
    id: v.string(),
    user_id: v.string(),
    store_id: v.string(),
  })
)

export type ApprovalForm = v.InferInput<typeof ApprovalSchema>
