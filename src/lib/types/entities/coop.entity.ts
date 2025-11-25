import type { SalesStatus } from '../common'
import type { ImageEntity } from './image.entity'
import type { CategoryEntity, ProductEntity } from './product.entity'
import type { StoreEntity } from './store.entity'

export interface CoopEntity {
  id: string
  name: string
  description: string
  storeId: string
  storeName: string
  store: StoreEntity
  productId: string
  productName: string
  product: ProductEntity
  categoryId: string
  categoryName: string
  category: CategoryEntity
  status: SalesStatus
  salesDate: string
  isToday: boolean
  remainingTime: string
  salesPrice: number
  maxQuantity: number
  orderedQuantity: number
  remainingQuantity: number
  progress: number
  representativeImageUrl: string
  images: ImageEntity[]
  createdAt: string
  updatedAt: string
}
