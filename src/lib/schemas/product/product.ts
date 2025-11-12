import type { ProductData } from '$lib/types'
import * as v from 'valibot'
import { ImageSchema } from '../common/image'

export const ProductSchema = v.pipe(
  v.object({
    storeId: v.string(),
    originId: v.optional(v.nullable(v.string())),
    categoryId: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.pipe(v.number()),
    unit: v.string(),
    quantityPerUnit: v.pipe(v.number()),
    images: v.array(ImageSchema),
    active: v.optional(v.boolean()),
  })
)

export const ProductCreateSchema = v.pipe(
  v.object({
    ...ProductSchema.entries,
    initialStock: v.pipe(v.number()),
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

export const createInitialProductValues = (storeId: string | undefined) => {
  if (!storeId) return {}

  return {
    storeId,
    categoryId: undefined,
    name: undefined,
    description: undefined,
    price: 1,
    initialStock: 1,
    unit: 'EA',
    quantityPerUnit: 1,
    images: [],
  }
}

export const productDataToUpdateInput = (product: ProductData): ProductUpdateInput => {
  const { id, storeId, categoryId, name, description, price, unit, quantityPerUnit, images, active } = product

  return {
    id,
    storeId,
    categoryId,
    name,
    description,
    price,
    unit,
    quantityPerUnit,
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      path: image.path,
      representative: image.representative,
      sortOrder: image.sortOrder,
      use: true,
      new: false,
    })),
    active: active,
  }
}
