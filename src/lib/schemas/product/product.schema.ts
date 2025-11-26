import type { ProductEntity } from '$lib/types'
import * as v from 'valibot'
import { ImageSchema } from '../common/image.schema'

export const ProductSchema = v.pipe(
  v.object({
    storeId: v.string(),
    originId: v.optional(v.nullable(v.string())),
    categoryId: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.pipe(v.number()),
    capacity: v.pipe(v.optional(v.string())),
    sellUnit: v.pipe(v.optional(v.string())),
    purchaseUnit: v.string(),
    purchaseQty: v.number(),
    images: v.pipe(v.array(ImageSchema), v.minLength(1, '상품 이미지를 최소 1개 이상 등록해주세요.')),
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
    purchaseUnit: undefined,
    images: [],
  }
}

export const productDataToUpdateInput = (product: ProductEntity): ProductUpdateInput => {
  const {
    id,
    storeId,
    categoryId,
    name,
    description,
    price,
    capacity,
    sellUnit,
    purchaseUnit,
    purchaseQty,
    images,
    active,
  } = product

  return {
    id,
    storeId,
    categoryId,
    name,
    description,
    price,
    capacity,
    sellUnit,
    purchaseUnit,
    purchaseQty,
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
