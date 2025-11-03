import { lookupEnum, SalesStatus } from '$lib/types'
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
      current_quantity,
      status,
      created_at,
      updated_at,
    } = data

    return {
      id,
      store_id,
      store: storeDataConverter().convert(store),
      product_id,
      product: productDataConverter().convert(product),
      category_id,
      category: categoryDataConverter().convert(category),
      status: lookupEnum(SalesStatus, status),
      sales_price,
      sales_date: dayjs(sales_date).format('YYYY-MM-DD HH:mm:ss'),
      max_quantity,
      current_quantity: current_quantity ?? 0,
      name,
      description,
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
