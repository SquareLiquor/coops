export interface CartData {
  userId: string
  storeId: string
  totalPrice: number
  totalQuantity: number
  itemsCount: number
  items: CartItemData[]
}

export interface CartItemData {
  coopId: string
  remainingQuantity: number
  productId: string
  name: string
  quantity: number
  price: number
  sales_date: string
  image: string
}
