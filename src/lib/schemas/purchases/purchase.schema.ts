import * as v from 'valibot'

export const PurchaseSchema = v.pipe(
  v.object({
    quantity: v.number(),
    price: v.number(),
    unit: v.string(),
    notes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
  })
)

export type PurchaseInput = v.InferInput<typeof PurchaseSchema>
