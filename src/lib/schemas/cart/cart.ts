import type { AuthState, StoreData } from '$lib/types'
import type { CartData, CartItemData } from '$lib/types/common/cart'
import * as v from 'valibot'

// basic
export const OrderItemSchema = v.object({
  coop_id: v.string(),
  product_id: v.string(),
  quantity: v.number(),
  price: v.number(),
})
export const OrderSchema = v.object({
  user_id: v.string(),
  store_id: v.string(),
  total_price: v.number(),
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

export type OrderCreateInput = v.InferInput<typeof OrderCreateSchema>
export type OrderItemCreateInput = v.InferInput<typeof OrderItemCreateSchema>

export const convertCartDataToOrderInput = (auth: AuthState, store: StoreData, data: CartData): OrderCreateInput => {
  const { totalPrice, items } = data

  return {
    user_id: auth.id,
    store_id: store.id,
    total_price: totalPrice,
    items: items.map(convertCartItemDataToOrderItemInput),
  }
}

const convertCartItemDataToOrderItemInput = (item: CartItemData): OrderItemCreateInput => {
  const { coopId, productId, quantity, price } = item

  return {
    coop_id: coopId,
    product_id: productId,
    quantity,
    price,
  }
}
