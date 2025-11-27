import * as v from 'valibot'

export const PurchaseSchema = v.pipe(
  v.object({
    storeId: v.pipe(v.string(), v.nonEmpty('매장을 선택해주세요.')),
    coopId: v.pipe(v.string(), v.nonEmpty('공동구매를 선택해주세요.')),
    productId: v.pipe(v.string(), v.nonEmpty('상품을 선택해주세요.')),
    quantity: v.pipe(v.number(), v.minValue(1, '수량은 1 이상이어야 합니다.')),
    price: v.pipe(v.number(), v.minValue(0, '가격은 0 이상이어야 합니다.')),
    unit: v.pipe(v.string(), v.nonEmpty('단위를 입력해주세요.')),
    notes: v.optional(v.string()),
  })
)

export const PurchaseCreateSchema = v.pipe(
  v.object({
    ...PurchaseSchema.entries,
    totalPrice: v.pipe(v.number(), v.minValue(0, '총액은 0 이상이어야 합니다.')),
  })
)

export const PurchaseUpdateSchema = v.pipe(
  v.object({
    id: v.pipe(v.string(), v.nonEmpty('발주 ID가 필요합니다.')),
    quantity: v.pipe(v.number(), v.minValue(1, '수량은 1 이상이어야 합니다.')),
    price: v.pipe(v.number(), v.minValue(0, '가격은 0 이상이어야 합니다.')),
    unit: v.pipe(v.string(), v.nonEmpty('단위를 입력해주세요.')),
    totalPrice: v.pipe(v.number(), v.minValue(0, '총액은 0 이상이어야 합니다.')),
    notes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
  })
)

export const PurchaseStatusChangeSchema = v.pipe(
  v.object({
    id: v.string(),
  })
)

export const PurchaseRejectSchema = v.pipe(
  v.object({
    id: v.pipe(v.string(), v.nonEmpty('발주 ID가 필요합니다.')),
    rejectionReason: v.pipe(v.string(), v.nonEmpty('거부 사유를 입력해주세요.')),
  })
)

export type PurchaseInput = v.InferInput<typeof PurchaseSchema>
export type PurchaseCreateInput = v.InferInput<typeof PurchaseCreateSchema>
export type PurchaseUpdateInput = v.InferInput<typeof PurchaseUpdateSchema>
export type PurchaseStatusChangeInput = v.InferInput<typeof PurchaseStatusChangeSchema>
export type PurchaseRejectInput = v.InferInput<typeof PurchaseRejectSchema>
