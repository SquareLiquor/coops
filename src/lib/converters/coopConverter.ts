import { lookupEnum, SalesStatus, type ImageData, type ProductData } from '$lib/types'
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
      images,
      created_at,
      updated_at,
    } = data

    return {
      id,
      name,
      description,
      images: coopImageDataConverter().convertAll(images),
      storeId: store_id,
      store: storeDataConverter().convert(store)!,
      productId: product_id,
      product: productDataConverter().convert(product)!,
      categoryId: category_id,
      category: categoryDataConverter().convert(category)!,
      status: lookupEnum(SalesStatus, status)!,
      salesPrice: sales_price,
      salesDate: dayjs(sales_date).format('YYYY-MM-DD HH:mm:ss'),
      isToday: dayjs().isSame(dayjs(sales_date), 'day'),
      remainingTime: dayjs(sales_date).diff(dayjs(), 'second').toString(),
      maxQuantity: max_quantity,
      currentQuantity: current_quantity ?? 0,
      remainingQuantity: Math.max(max_quantity - current_quantity, 0),
      progress: Math.min(Math.round((current_quantity / max_quantity) * 100), 100),

      createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): CoopData[] | [] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is CoopData => item !== null)
  }

  return { convert, convertAll }
}

export const coopImageDataConverter = () => {
  const convert = (data: any): ImageData | undefined => {
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

  const convertAll = (datas: any[]): ImageData[] | [] => {
    if (!datas) return []

    return datas
      .map(convert)
      .filter((item): item is ImageData => item !== null)
      .sort((a, b) => {
        if (a.representative && !b.representative) return -1
        if (!a.representative && b.representative) return 1
        return a.sortOrder - b.sortOrder
      })
  }

  return { convert, convertAll }
}

/**
 * 상품 데이터를
 */
export const convertProductToCoop = ({ product, images }: { product: ProductData; images: ImageData[] }) => {
  const { id, name, description, price, unit, quantityPerUnit: quantity_per_unit } = product

  return {
    name,
    description,
    salesPrice: price,
    product: {
      originId: id,
      price,
      unit,
      quantityPerUnit: quantity_per_unit,
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
