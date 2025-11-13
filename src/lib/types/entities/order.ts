import type { OrderStatus } from '../common'
import type { CoopData } from './coop'
import type { ImageData } from './image'
import type { StoreData } from './store'

export interface OrderData {
  id: string
  name: string
  userId: string
  userName: string
  storeId: string
  store: StoreData
  totalPrice: number
  status: OrderStatus
  items: OrderItemData[]
  orderedAt: string
  updatedAt: string
}

export interface OrderItemData {
  id: string
  orderId: string
  coopId: string
  coop: CoopData
  quantity: number
  price: number
  totalPrice: number
  status: OrderStatus
  images: ImageData[]
}
