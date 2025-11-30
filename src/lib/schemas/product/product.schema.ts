import type { ProductEntity } from '$lib/types'
import * as v from 'valibot'
import { ImageSchema } from '../common/image.schema'

export const ProductSchema = v.pipe(
  v.object({
    storeId: v.string(),
    originId: v.optional(v.nullable(v.string())),
    categoryId: v.pipe(v.string(), v.nonEmpty('카테고리를 선택해주세요.')),
    name: v.pipe(v.string(), v.trim(), v.nonEmpty('상품명을 입력해주세요.')),
    description: v.pipe(v.string(), v.trim(), v.nonEmpty('상품 설명을 입력해주세요.')),
    price: v.pipe(v.number(), v.minValue(1, '가격은 0보다 커야 합니다.')),
    capacity: v.optional(v.string()),
    sellUnit: v.optional(v.string()),
    purchaseUnit: v.pipe(v.string(), v.nonEmpty('구매 단위를 입력해주세요.')),
    purchaseQty: v.pipe(v.number(), v.minValue(1, '구매 수량은 1 이상이어야 합니다.')),
    images: v.pipe(v.array(ImageSchema), v.minLength(1, '상품 이미지를 최소 1개 이상 등록해주세요.')),
    active: v.optional(v.boolean()),
  })
)

export const ProductCreateSchema = v.pipe(
  v.object({
    ...ProductSchema.entries,
    initialStock: v.pipe(v.number(), v.minValue(1, '초기 재고는 0 이상이어야 합니다.')),
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
    active: true,
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
