export interface CartData {
  totalPrice: number
  totalQuantity: number
  itemsCount: number
  items: CartItemData[]
}

export interface CartItemData {
  id: string
  name: string
  quantity: number
  price: number
  sales_date: string
  image: string
}
