import type { ImageData } from './image'

export interface CategoryData {
  id: string
  storeId: string
  name: string
  description: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductData {
  id: string
  storeId: string
  originId?: string | null
  categoryId: string
  category?: CategoryData
  name: string
  description: string
  price: number
  initialStock: number
  unit: string
  quantityPerUnit: number
  images: ImageData[]
  active: boolean
  createdAt: string
  updatedAt: string
}
