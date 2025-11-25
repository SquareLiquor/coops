import type { ImageEntity } from '$lib/types'
import dayjs from 'dayjs'

export const toImageEntity = (data: any): ImageEntity | undefined => {
  if (!data) return undefined

  const { id, product_id, url, path, representative, sort_order, created_at, updated_at } = data

  return {
    id,
    productId: product_id,
    url,
    path,
    representative,
    sortOrder: sort_order,
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toImageEntities = (datas: any[] | null): ImageEntity[] | [] => {
  if (!datas) return []

  return datas
    .map(toImageEntity)
    .filter((item): item is ImageEntity => item !== null)
    .sort((a, b) => {
      if (a.representative && !b.representative) return -1
      if (!a.representative && b.representative) return 1
      return a.sortOrder - b.sortOrder
    })
}
