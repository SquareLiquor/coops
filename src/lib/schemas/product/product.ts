import * as v from 'valibot'

export const ProductCreationSchema = v.pipe(
  v.object({
    store_id: v.string(),
    origin_id: v.optional(v.nullable(v.string())),
    category_id: v.optional(v.string()), // TODO: 필수값으로 변경
    name: v.string(),
    description: v.string(),
    price: v.number(),
    initial_stock: v.number(),
    images: v.pipe(
      v.array(
        v.object({
          is_representative: v.boolean(),
          file: v.file(),
        })
      ),
      // v.minLength(1, '최소 하나 이상의 이미지를 업로드해야 합니다.'),
      v.maxLength(5, '최대 다섯 개의 이미지만 업로드할 수 있습니다.')
      // v.checkItems((image) => image.is_representative, '대표 이미지가 반드시 하나 포함되어야 합니다.')
    ),
    active: v.optional(v.boolean()),
  })
)

export type ProductCreationData = v.InferInput<typeof ProductCreationSchema>
