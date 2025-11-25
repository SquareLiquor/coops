import type { CategoryEntity } from '$lib/types'
import dayjs from 'dayjs'

export const toCategoryEntity = (data: any | null): CategoryEntity | undefined => {
  if (!data) return undefined

  const { id, store_id, name, description, active, created_at, updated_at } = data

  return {
    id,
    storeId: store_id,
    name,
    description,
    active,
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toCategoryEntities = (datas: any[] | null): CategoryEntity[] | [] => {
  if (!datas) return []

  return datas.map(toCategoryEntity).filter((item): item is CategoryEntity => item !== undefined)
}
