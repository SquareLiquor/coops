export interface CategoryData {
  id: string
  store_id: string
  name: string
  active: boolean
  created_at: string
  updated_at: string
}
export interface ProductData {
  id: string
  store_id: string
  origin_id?: string | null
  category_id?: string
  name: string
  description?: string | null
  price: number
  initial_stock: number
  current_stock: number
  images: ProductImageData[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImageData {
  id: string
  product_id: string
  url: string
  is_representative: boolean
  sort_order: number
  created_at: string
}
