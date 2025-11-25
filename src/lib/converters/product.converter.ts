import type { ProductEntity } from '$lib/types'
import dayjs from 'dayjs'
import { toCategoryEntity } from './category.converter'
import { toImageEntities } from './image.converter'

export const toProductEntity = (data: any): ProductEntity | undefined => {
  if (!data) return undefined

  const {
    id,
    store_id,
    origin_id,
    category_id,
    category,
    name,
    description,
    price,
    initial_stock,
    unit,
    quantity_per_unit,
    images,
    active,
    created_at,
    updated_at,
  } = data

  return {
    id,
    storeId: store_id,
    originId: origin_id,
    categoryId: category_id,
    category: toCategoryEntity(category),
    name,
    description,
    price,
    initialStock: initial_stock,
    unit,
    quantityPerUnit: quantity_per_unit,
    images: toImageEntities(images),
    active,
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toProduictEntities = (datas: any[] | null): ProductEntity[] | [] => {
  if (!datas) return []

  return datas.map(toProductEntity).filter((item): item is ProductEntity => item !== null)
}
