import { SalesStatus, type CoopData } from '$lib/types'
import dayjs from 'dayjs'
import * as v from 'valibot'
import { ImageSchema } from '../common/image'

export const CoopSchema = v.pipe(
  v.object({
    storeId: v.string(),
    categoryId: v.pipe(v.string(), v.nonEmpty('카테고리를 선택해주세요.')),
    status: v.pipe(v.string(), v.nonEmpty('판매 상태를 선택해주세요.')),
    maxQuantity: v.pipe(v.number(), v.minValue(1, '판매 가능 수량은 0보다 커야 합니다.')),
    salesPrice: v.pipe(v.number(), v.minValue(1, '판매 가격은 0보다 커야 합니다.')),
    salesDate: v.pipe(v.string(), v.nonEmpty('판매 시작일을 선택해주세요.')),
    name: v.pipe(v.string(), v.nonEmpty('상품명을 입력해주세요.')),
    description: v.pipe(v.string(), v.nonEmpty('상품 설명을 입력해주세요.')),
    images: v.pipe(v.array(ImageSchema), v.minLength(1, '상품 이미지를 최소 1개 이상 등록해주세요.')),
    product: v.pipe(
      v.object({
        originId: v.string(),
        price: v.pipe(v.number(), v.minValue(1, '가격은 0보다 커야 합니다.')),
        unit: v.pipe(v.string(), v.nonEmpty('단위를 입력해주세요.')),
        quantityPerUnit: v.pipe(v.number(), v.minValue(1, '단위 별 수량은 0보다 커야 합니다.')),
      })
    ),
  }),
  v.forward(
    v.partialCheck(
      [['salesDate']],
      (input) => {
        return dayjs(input.salesDate).isAfter(dayjs())
      },
      '판매 시작일은 오늘 이후여야 합니다.'
    ),
    ['salesDate']
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
    productId: v.string(),
  })
)

export const CoopCopyProductSchema = v.pipe(v.object({}))

export type CoopCreateInput = v.InferInput<typeof CoopCreateSchema>
export type CoopUpdateInput = v.InferInput<typeof CoopUpdateSchema>

export const getInitialCoopValues = (storeId: string) => {
  return {
    storeId,
    status: SalesStatus.PREPARING.code,
    salesDate: dayjs().format('YYYY-MM-DD'),
  }
}

export const coopDataToUpdateInput = (coop: any): CoopUpdateInput => {
  const {
    id,
    store_id,
    product_id,
    category_id,
    name,
    description,
    status,
    max_quantity,
    sales_price,
    sales_date,
    product,
    images,
  } = coop

  return {
    id,
    storeId: store_id,
    productId: product_id,
    categoryId: category_id,
    name,
    description,
    status: status?.code || status,
    maxQuantity: max_quantity,
    salesPrice: sales_price,
    salesDate: dayjs(sales_date).format('YYYY-MM-DD'),
    product: {
      originId: product.origin_id || product.id,
      price: product.price,
      unit: product.unit,
      quantityPerUnit: product.quantity_per_unit,
    },
    images:
      images?.map((image: any) => ({
        id: image.id,
        url: image.url,
        path: image.path,
        representative: image.representative,
        sortOrder: image.sort_order,
        use: true,
        new: false,
      })) || [],
  }
}

export const coopDataToCartItemData = (coop: CoopData, quantity: number) => {
  const {
    name,
    salesPrice: price,
    salesDate: sales_date,
    product: { images },
  } = coop

  return {
    coopId: coop.id,
    productId: coop.product.id,
    name,
    quantity,
    price,
    sales_date,
    image: images.find((image) => image.representative)?.url || '',
  }
}
