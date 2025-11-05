import type { SalesStatus } from '../common'
import type { CategoryData, ProductData } from './product'
import type { StoreData } from './store'

export interface CoopData {
  id: string
  name: string
  description: string
  store_id: string
  store: StoreData
  product_id: string
  product: ProductData
  category_id: string
  category: CategoryData
  status: SalesStatus
  sales_price: number
  sales_date: string
  is_today: boolean
  remaining_time: string
  max_quantity: number
  current_quantity: number
  remaining_quantity: number
  progress: number
  created_at: string
  updated_at: string
}
