import type { ImageEntity } from './image.entity'

export interface CategoryEntity {
  id: string
  storeId: string
  name: string
  description: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductEntity {
  id: string
  storeId: string
  originId?: string | null
  categoryId: string
  category?: CategoryEntity
  name: string
  description: string
  price: number
  initialStock: number
  unit: string
  quantityPerUnit: number
  images: ImageEntity[]
  active: boolean
  createdAt: string
  updatedAt: string
}
