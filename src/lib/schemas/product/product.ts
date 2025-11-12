import type { ProductData } from '$lib/types'
import * as v from 'valibot'
import { ImageSchema } from '../common/image'

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
    images: v.array(ImageSchema),
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

export const productDataToUpdateInput = (product: ProductData): ProductUpdateInput => {
  const { id, store_id, category_id, name, description, price, unit, quantity_per_unit, images, active } = product

  return {
    id,
    store_id,
    category_id,
    name,
    description,
    price,
    unit,
    quantity_per_unit,
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      representative: image.representative,
      sortOrder: image.sortOrder,
    })),
    active: product.active,
  }
}
