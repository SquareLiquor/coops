import * as v from 'valibot'

export const ProductCreationSchema = v.object({
  store_id: v.string(),
  origin_id: v.optional(v.nullable(v.string())),
  category_id: v.optional(v.nullable(v.string())),
  name: v.string(),
  description: v.optional(v.nullable(v.string())),
  price: v.number(),
  initial_stock: v.number(),
  date: v.optional(v.nullable(v.string())),
  image_url: v.optional(v.nullable(v.string())),
  active: v.optional(v.boolean()),
})

export type ProductCreationData = v.InferInput<typeof ProductCreationSchema>
