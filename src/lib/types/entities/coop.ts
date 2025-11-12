import type { SalesStatus } from '../common'
import type { ImageData } from './image'
import type { CategoryData, ProductData } from './product'
import type { StoreData } from './store'

export interface CoopData {
  id: string
  name: string
  description: string
  images: ImageData[]
  storeId: string
  store: StoreData
  productId: string
  product: ProductData
  categoryId: string
  category: CategoryData
  status: SalesStatus
  salesPrice: number
  salesDate: string
  isToday: boolean
  remainingTime: string
  maxQuantity: number
  currentQuantity: number
  remainingQuantity: number
  progress: number
  createdAt: string
  updatedAt: string
}
