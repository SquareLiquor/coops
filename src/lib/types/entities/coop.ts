import type { SalesStatus } from '../common'
import type { CategoryData, ProductData } from './product'
import type { StoreData } from './store'

export interface CoopData {
  id: string
  store_id: string
  store?: StoreData
  product_id: string
  product?: ProductData
  category_id: string
  category?: CategoryData
  status?: SalesStatus
  sales_price: number
  sales_date: string
  max_quantity: number
  current_quantity: number
  name: string
  description: string
  created_at: string
  updated_at: string
}
