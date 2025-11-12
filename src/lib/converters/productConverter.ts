import type { CategoryData, ImageData, ProductData } from '$lib/types'
import dayjs from 'dayjs'

export const productDataConverter = () => {
  const convert = (data: any): ProductData | undefined => {
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
      category: categoryDataConverter().convert(category),
      name,
      description,
      price,
      initialStock: initial_stock,
      unit,
      quantityPerUnit: quantity_per_unit,
      images: productImageDataConverter().convertAll(images),
      active,
      createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): ProductData[] | [] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is ProductData => item !== null)
  }

  return { convert, convertAll }
}

export const productImageDataConverter = () => {
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

    return datas.map(convert).filter((item): item is ImageData => item !== null)
  }

  return { convert, convertAll }
}

export const categoryDataConverter = () => {
  const convert = (data: any | null): CategoryData | undefined => {
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

  const convertAll = (datas: any[] | null): CategoryData[] | [] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is CategoryData => item !== undefined)
  }

  return { convert, convertAll }
}
