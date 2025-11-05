import { SalesStatus } from '$lib/types'
import dayjs from 'dayjs'
import * as v from 'valibot'
import { ProductImagesSchema } from '../product/product'

export const ProductImageSchemaForCoop = v.pipe(
  v.object({
    ...ProductImagesSchema.entries,
    isOrigin: v.boolean(),
  })
)

export const ProductSchemaForCoop = v.pipe(
  v.object({
    origin_id: v.string(),
    // 화면에서 변경하는 데이터
    price: v.pipe(v.number(), v.minValue(1, '가격은 0보다 커야 합니다.')),
    unit: v.pipe(v.string(), v.nonEmpty('단위를 입력해주세요.')),
    quantity_per_unit: v.pipe(v.number(), v.minValue(1, '단위 별 수량은 0보다 커야 합니다.')),
    images: v.array(ProductImageSchemaForCoop),
  })
)

export type ProductInputForCoop = v.InferInput<typeof ProductSchemaForCoop>
export type ProductImageInputForCoop = v.InferInput<typeof ProductImageSchemaForCoop>

export const CoopSchema = v.pipe(
  v.object({
    store_id: v.string(),
    category_id: v.pipe(v.string(), v.nonEmpty('카테고리를 선택해주세요.')),
    status: v.pipe(v.string(), v.nonEmpty('판매 상태를 선택해주세요.')),
    max_quantity: v.pipe(v.number(), v.minValue(1, '판매 가능 수량은 0보다 커야 합니다.')),
    sales_price: v.pipe(v.number(), v.minValue(1, '판매 가격은 0보다 커야 합니다.')),
    sales_date: v.pipe(v.string(), v.nonEmpty('판매 시작일을 선택해주세요.')),
    name: v.pipe(v.string(), v.nonEmpty('상품명을 입력해주세요.')),
    description: v.pipe(v.string(), v.nonEmpty('상품 설명을 입력해주세요.')),
    product: ProductSchemaForCoop,
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
    product_id: v.string(),
  })
)

export const CoopCopyProductSchema = v.pipe(v.object({}))

export type CoopCreateInput = v.InferInput<typeof CoopCreateSchema>
export type CoopUpdateInput = v.InferInput<typeof CoopUpdateSchema>

export const getInitialCoopValues = (store_id: string | undefined) => {
  if (!store_id) return {}

  return {
    store_id,
    status: SalesStatus.PREPARING.code,
    sales_date: dayjs().format('YYYY-MM-DD'),
  }
}
