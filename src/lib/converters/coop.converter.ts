import { SalesStatus, type ImageEntity, type ProductEntity } from '$lib/types'
import type { CoopEntity } from '$lib/types/entities/coop.entity'
import { lookupEnum } from '$lib/utils/enum'
import dayjs from 'dayjs'
import { toCategoryEntity } from './category.converter'
import { toImageEntities } from './image.converter'
import { toProductEntity } from './product.converter'
import { toStoreEntity } from './store.converter'

export const toCoopEntity = (data: any): CoopEntity | undefined => {
  if (!data) return undefined

  const {
    id,
    name,
    description,
    store_id,
    store_name,
    store,
    product_id,
    product_name,
    product,
    category_id,
    category_name,
    category,
    status,
    sales_date,
    sales_price,
    max_quantity,
    ordered_quantity = 0,
    representative_image_url,
    images,
    created_at,
    updated_at,
  } = data

  return {
    id,
    name,
    description,
    storeId: store_id,
    storeName: store_name,
    store: toStoreEntity(store)!,
    productId: product_id,
    productName: product_name,
    product: toProductEntity(product)!,
    categoryId: category_id,
    categoryName: category_name,
    category: toCategoryEntity(category)!,
    status: lookupEnum(SalesStatus, status)!,
    salesDate: dayjs(sales_date).format('YYYY-MM-DD HH:mm:ss'),
    isToday: dayjs().isSame(dayjs(sales_date), 'day'),
    remainingTime: dayjs(sales_date).diff(dayjs(), 'second').toString(),
    salesPrice: sales_price,
    maxQuantity: max_quantity,
    orderedQuantity: ordered_quantity ?? 0,
    remainingQuantity: Math.max(max_quantity - ordered_quantity, 0),
    progress: Math.min(Math.round((ordered_quantity / max_quantity) * 100), 100),
    images: toImageEntities(images),
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toCoopEntities = (datas: any[] | null): CoopEntity[] | [] => {
  if (!datas) return []

  return datas.map(toCoopEntity).filter((item): item is CoopEntity => item !== null)
}

/**
 * TODO: transform으로 분리
 */
export const convertProductToCoop = ({ product, images }: { product: ProductEntity; images: ImageEntity[] }) => {
  const { id, name, description, price, unit, quantityPerUnit } = product

  return {
    name,
    description,
    salesPrice: price,
    product: {
      originId: id,
      price,
      unit,
      quantityPerUnit,
    },
    images: images.map((image) => ({
      url: image.url,
      path: image.path,
      representative: image.representative,
      sortOrder: image.sortOrder,
      new: false,
      use: true,
    })),
  }
}
