import * as v from 'valibot'

export const ProductImagesSchema = v.pipe(
  v.object({
    id: v.optional(v.string()),
    url: v.string(),
    representative: v.boolean(),
    sort_order: v.number(),
    toDelete: v.optional(v.boolean(), false),
  })
)

export const ProductSchema = v.pipe(
  v.object({
    store_id: v.string(),
    origin_id: v.optional(v.nullable(v.string())),
    category_id: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.pipe(v.number()),
    unit: v.string(),
    quantity_per_unit: v.pipe(v.number()),
    images: v.array(ProductImagesSchema),
    active: v.optional(v.boolean()),
  })
)

export const ProductCreateSchema = v.pipe(
  v.object({
    ...ProductSchema.entries,
    initial_stock: v.pipe(v.number()),
  })
)

export const ProductUpdateSchema = v.pipe(
  v.object({
    id: v.string(),
    ...ProductSchema.entries,
  })
)

export type ProductCreateInput = v.InferInput<typeof ProductCreateSchema>
export type ProductUpdateInput = v.InferInput<typeof ProductUpdateSchema>
export type ProductImagesInput = v.InferInput<typeof ProductImagesSchema>

export const createInitialProductValues = (store_id: string | undefined) => {
  if (!store_id) return {}

  return {
    store_id: store_id,
    category_id: undefined,
    name: undefined,
    description: undefined,
    price: 1,
    initial_stock: 1,
    unit: 'EA',
    quantity_per_unit: 1,
    images: [],
  }
}
