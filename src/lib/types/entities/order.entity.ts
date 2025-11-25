import type { OrderStatus } from '../common'
import type { CoopEntity } from './coop.entity'
import type { ImageEntity } from './image.entity'
import type { StoreEntity } from './store.entity'

export interface OrderEntity {
  id: string
  name: string
  userId: string
  userName: string
  storeId: string
  store: StoreEntity
  totalPrice: number
  status: OrderStatus
  items: OrderItemEntity[]

  cancelable: boolean
  completableForAdmin: boolean
  cancelableForAdmin: boolean
  restorableForAdmin: boolean

  createdAt: string
  updatedAt: string
}

export interface OrderItemEntity {
  id: string
  orderId: string
  coopId: string
  coop: CoopEntity
  quantity: number
  price: number
  totalPrice: number
  status: OrderStatus

  cancelable: boolean
  completableForAdmin: boolean
  cancelableForAdmin: boolean
  restorableForAdmin: boolean

  images: ImageEntity[]
  createdAt: string
  updatedAt: string
}
