import * as v from 'valibot'

export const ProductCreationSchema = v.pipe(
  v.object({
    store_id: v.string(),
    origin_id: v.optional(v.nullable(v.string())),
    category_id: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.pipe(v.number()),
    initial_stock: v.pipe(v.number()),
    unit: v.string(),
    quantity_per_unit: v.pipe(v.number()),
    images: v.optional(v.string()),
    // images: v.pipe(
    //   v.array(
    //     v.object({
    //       representative: v.boolean(),
    //       file: v.file(),
    //     })
    //   ),
    //   v.minLength(0, '최소 하나 이상의 이미지를 업로드해야 합니다.'),
    //   v.maxLength(5, '최대 다섯 개의 이미지만 업로드할 수 있습니다.')
    //   // v.checkItems((image) => image.representative, '대표 이미지가 반드시 하나 포함되어야 합니다.')
    // ),
    active: v.optional(v.boolean()),
  })
)

export type ProductInput = v.InferInput<typeof ProductCreationSchema>

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
    images: undefined,
  }
}
