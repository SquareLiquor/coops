import type { AuthState, StoreData } from '$lib/types'
import type { CartData, CartItemData } from '$lib/types/common/cart'
import * as v from 'valibot'

// basic
export const OrderItemSchema = v.object({
  coopId: v.string(),
  productId: v.string(),
  quantity: v.number(),
  price: v.number(),
})
export const OrderSchema = v.object({
  userId: v.string(),
  userName: v.string(),
  storeId: v.string(),
  totalPrice: v.number(),
  items: v.array(OrderItemSchema),
})

// create
export const OrderItemCreateSchema = v.pipe(
  v.object({
    ...OrderItemSchema.entries,
  })
)
export const OrderCreateSchema = v.pipe(
  v.object({
    ...OrderSchema.entries,
    items: v.array(OrderItemCreateSchema),
  })
)

export const OrderUpdateSchema = v.pipe(
  v.object({
    orderId: v.string(),
    orderItemId: v.string(),
  })
)

export type OrderCreateInput = v.InferInput<typeof OrderCreateSchema>
export type OrderItemCreateInput = v.InferInput<typeof OrderItemCreateSchema>
export type OrderUpdateInput = v.InferInput<typeof OrderUpdateSchema>

export const convertCartDataToOrderInput = (auth: AuthState, store: StoreData, data: CartData): OrderCreateInput => {
  const { totalPrice, items } = data

  return {
    userId: auth.id,
    userName: auth.user?.user_metadata.user_name,
    storeId: store.id,
    totalPrice: totalPrice,
    items: items.map(convertCartItemDataToOrderItemInput),
  }
}

const convertCartItemDataToOrderItemInput = (item: CartItemData): OrderItemCreateInput => {
  const { coopId, productId, quantity, price } = item

  return {
    coopId,
    productId,
    quantity,
    price,
  }
}
