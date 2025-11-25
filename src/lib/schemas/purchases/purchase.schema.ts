import * as v from 'valibot'

export const PurchaseSchema = v.pipe(v.object({}))

export type PurchaseInput = v.InferInput<typeof PurchaseSchema>
