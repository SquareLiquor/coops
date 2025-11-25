import { OrderStatus, type OrderEntity, type OrderItemEntity } from '$lib/types'
import { lookupEnum } from '$lib/utils/enum'
import dayjs from 'dayjs'
import { toCoopEntity } from './coop.converter'
import { toImageEntities } from './image.converter'
import { toStoreEntity } from './store.converter'

export const toOrderEntity = (data: any): OrderEntity | undefined => {
  if (!data) return undefined

  const { id, user_id, user_name, store_id, store, total_price, status, items, created_at, updated_at } = data

  return {
    id,
    name: '', // TODO ... 외 n건
    userId: user_id,
    userName: user_name,
    storeId: store_id,
    store: toStoreEntity(store)!,
    totalPrice: total_price,
    status: lookupEnum(OrderStatus, status)!,
    items: toOrderItemEntities(items),
    cancelable: status === OrderStatus.CREATED.code,
    cancelableForAdmin: status === OrderStatus.CREATED.code || status === OrderStatus.COMPLETED.code,
    completableForAdmin: status === OrderStatus.CREATED.code,
    restorableForAdmin: status === OrderStatus.CANCELLED.code,
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toOrderEntities = (datas: any[] | null): OrderEntity[] => {
  if (!datas) return []

  return datas.map(toOrderEntity).filter((item): item is OrderEntity => item !== null)
}

export const toOrderItemEntity = (data: any): OrderItemEntity | undefined => {
  if (!data) return undefined

  const { id, order_id, coop_id, coop, quantity, price, total_price, status, created_at, updated_at } = data

  return {
    id,
    orderId: order_id,
    coopId: coop_id,
    coop: toCoopEntity(coop)!,
    quantity,
    price,
    totalPrice: total_price,
    cancelable: status === OrderStatus.CREATED.code,
    cancelableForAdmin: status === OrderStatus.CREATED.code || status === OrderStatus.COMPLETED.code,
    completableForAdmin: status === OrderStatus.CREATED.code,
    restorableForAdmin: status === OrderStatus.CANCELLED.code,
    status: lookupEnum(OrderStatus, status)!,
    images: toImageEntities(coop.images), //TODO 이미지 컨버터 공통화
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toOrderItemEntities = (datas: any[] | null): OrderItemEntity[] => {
  if (!datas) return []

  return datas.map(toOrderItemEntity).filter((item): item is OrderItemEntity => item !== null)
}
