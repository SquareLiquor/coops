import type { SalesStatus } from '../common'
import type { ImageData } from './image'
import type { CategoryData, ProductData } from './product'
import type { StoreData } from './store'

export interface CoopData {
  id: string
  name: string
  description: string
  storeId: string
  storeName: string
  store: StoreData
  productId: string
  productName: string
  product: ProductData
  categoryId: string
  categoryName: string
  category: CategoryData
  status: SalesStatus
  salesDate: string
  isToday: boolean
  remainingTime: string
  salesPrice: number
  maxQuantity: number
  orderedQuantity: number
  remainingQuantity: number
  progress: number
  images: ImageData[]
  createdAt: string
  updatedAt: string
}
