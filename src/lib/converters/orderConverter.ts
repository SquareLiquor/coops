import { lookupEnum, OrderStatus, type OrderData, type OrderItemData } from '$lib/types'
import dayjs from 'dayjs'
import { coopDataConverter, coopImageDataConverter } from './coopConverter'
import { storeDataConverter } from './storeConverter'

export const orderDataConverter = () => {
  const convert = (data: any): OrderData | undefined => {
    if (!data) return undefined

    const { id, user_id, user_name, store_id, store, total_price, status, items, ordered_at, updated_at } = data

    return {
      id,
      name: '', // TODO ... 외 n건
      userId: user_id,
      userName: user_name,
      storeId: store_id,
      store: storeDataConverter().convert(store)!,
      totalPrice: total_price,
      status: lookupEnum(OrderStatus, status)!,
      items: orderItemDataConverter().convertAll(items),
      orderedAt: dayjs(ordered_at).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): OrderData[] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is OrderData => item !== null)
  }

  return { convert, convertAll }
}

export const orderItemDataConverter = () => {
  const convert = (data: any): OrderItemData | undefined => {
    if (!data) return undefined

    const { id, order_id, coop_id, coop, quantity, price, total_price, status } = data

    return {
      id,
      orderId: order_id,
      coopId: coop_id,
      coop: coopDataConverter().convert(coop)!,
      quantity,
      price,
      totalPrice: total_price,
      status: lookupEnum(OrderStatus, status)!,
      images: coopImageDataConverter().convertAll(coop.images), //TODO 이미지 컨버터 공통화
    }
  }

  const convertAll = (datas: any[]): OrderItemData[] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is OrderItemData => item !== null)
  }

  return { convert, convertAll }
}
