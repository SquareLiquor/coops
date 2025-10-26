// 상품 테이블(public.products) 기반 타입
export interface Product {
  id: string
  store_id: string
  origin_id?: string | null
  category_id?: string | null
  name: string
  description?: string | null
  price: number
  initial_stock: number
  date?: string | null // ISO date string
  image_url?: string | null
  active: boolean
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}
