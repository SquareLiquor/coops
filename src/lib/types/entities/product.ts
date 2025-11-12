export interface CategoryData {
  id: string
  store_id: string
  name: string
  description: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductData {
  id: string
  store_id: string
  origin_id?: string | null
  category_id: string
  category?: CategoryData
  name: string
  description: string
  price: number
  initial_stock: number
  unit: string
  quantity_per_unit: number
  images: ImageData[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface ImageData {
  id: string
  productId: string
  url: string
  path: string
  representative: boolean
  sortOrder: number
  created_at: string
  updated_at: string
}
