import { SalesStatus } from '$lib/types'
import dayjs from 'dayjs'
import * as v from 'valibot'
import { ProductImagesSchema } from '../product/product'

export const OriginProductImageSchema = v.pipe(
  v.object({
    ...ProductImagesSchema.entries,
    isOrigin: v.boolean(),
  })
)

export const OriginProductSchema = v.pipe(
  v.object({
    origin_id: v.string(),
    // 화면에서 변경하는 데이터
    name: v.string(),
    price: v.number(),
    category_id: v.string(),
    unit: v.string(),
    images: v.array(OriginProductImageSchema),
  })
)

export type OriginProductInput = v.InferInput<typeof OriginProductSchema>
export type OriginProductImageInput = v.InferInput<typeof OriginProductImageSchema>

export const CoopSchema = v.pipe(
  v.object({
    store_id: v.string(),
    product_id: v.optional(v.string()),
    status: v.string(),
    max_quantity: v.pipe(v.number(), v.minValue(1, '판매 가능 수량은 0보다 커야 합니다.')),
    sales_price: v.pipe(v.number(), v.minValue(1, '판매 가격은 0보다 커야 합니다.')),
    sales_date: v.pipe(v.string()),
    name: v.pipe(v.string(), v.nonEmpty('상품명을 입력해주세요.')),
    description: v.pipe(v.string(), v.nonEmpty('상품 설명을 입력해주세요.')),
    // for Product copy
    mappedProduct: OriginProductSchema,
  }),
  v.forward(
    v.partialCheck(
      [['sales_date']],
      (input) => {
        return dayjs(input.sales_date).isAfter(dayjs())
      },
      '판매 시작일은 오늘 이후여야 합니다.'
    ),
    ['sales_date']
  )
)

export const CoopCreateSchema = v.pipe(
  v.object({
    ...CoopSchema.entries,
  })
)

export const CoopUpdateSchema = v.pipe(
  v.object({
    id: v.string(),
    ...CoopSchema.entries,
  })
)

export const CoopCopyProductSchema = v.pipe(v.object({}))

export type CoopCreateInput = v.InferInput<typeof CoopCreateSchema>
export type CoopUpdateInput = v.InferInput<typeof CoopUpdateSchema>

export const createInitialCoopValues = (store_id: string | undefined) => {
  if (!store_id) return {}

  return {
    store_id,
    status: SalesStatus.PREPARING.code,
    sales_date: dayjs().format('YYYY-MM-DD'),
  }
}
