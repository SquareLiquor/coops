import { lookupEnum, SalesStatus, type ProductData, type ProductImageData } from '$lib/types'
import type { CoopData } from '$lib/types/entities/coop'
import dayjs from 'dayjs'
import { categoryDataConverter, productDataConverter } from './productConverter'
import { storeDataConverter } from './storeConverter'

export const coopDataConverter = () => {
  const convert = (data: any): CoopData | undefined => {
    if (!data) return undefined

    const {
      id,
      store_id,
      store,
      product_id,
      product,
      category_id,
      category,
      name,
      description,
      sales_price,
      sales_date,
      max_quantity,
      current_quantity = 0,
      status,
      created_at,
      updated_at,
    } = data

    return {
      id,
      name,
      description,
      store_id,
      store: storeDataConverter().convert(store),
      product_id,
      product: productDataConverter().convert(product),
      category_id,
      category: categoryDataConverter().convert(category),
      status: lookupEnum(SalesStatus, status),
      sales_price,
      sales_date: dayjs(sales_date).format('YYYY-MM-DD HH:mm:ss'),
      is_today: dayjs().isSame(dayjs(sales_date), 'day'),
      remaining_time: dayjs(sales_date).diff(dayjs(), 'second').toString(),
      max_quantity,
      current_quantity: current_quantity ?? 0,
      remaining_quantity: Math.max(max_quantity - current_quantity, 0),
      progress: Math.min(Math.round((current_quantity / max_quantity) * 100), 100),
      created_at: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
      updated_at: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): CoopData[] | [] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is CoopData => item !== null)
  }

  return { convert, convertAll }
}

export const convertProductToCoop = ({ product, images }: { product: ProductData; images: ProductImageData[] }) => {
  const { id, price, unit, quantity_per_unit } = product

  return {
    origin_id: id,
    price: price,
    unit,
    quantity_per_unit,
    images: images.map((img) => ({
      url: img.url,
      representative: img.representative,
      sort_order: img.sort_order,
      toDelete: false,
      isOrigin: true,
    })),
  }
}
