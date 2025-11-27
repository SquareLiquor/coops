import type { StoreEntity, StoreMemberEntity } from '$lib/types'
import dayjs from 'dayjs'
import { toProfileEntity } from './profile.converter'

export const toStoreEntity = (data: any): StoreEntity | undefined => {
  if (!data) return undefined

  const {
    id,
    name,
    type,
    address,
    address_detail,
    latitude,
    longitude,
    place_id,
    phone,
    owner_id,
    owner,
    active,
    created_at,
    updated_at,
  } = data

  return {
    id,
    name,
    type,
    address,
    addressDetail: address_detail,
    latitude,
    longitude,
    placeId: place_id,
    phone,
    ownerId: owner_id,
    owner: toProfileEntity(owner),
    active,
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toStoreEntities = (datas: any[] | null): StoreEntity[] => {
  if (!datas) return []

  return datas.map(toStoreEntity).filter((item): item is StoreEntity => item !== undefined)
}

export const toStoreMemberEntity = (data: any): StoreMemberEntity | undefined => {
  if (!data) return undefined

  const { id, store_id, user_id, store, profile, created_at } = data

  return {
    id,
    storeId: store_id,
    userId: user_id,
    store: toStoreEntity(store),
    profile: toProfileEntity(profile),
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toStoreMemberEntities = (datas: any[] | null): StoreMemberEntity[] => {
  if (!datas) return []

  return datas.map(toStoreMemberEntity).filter((item): item is StoreMemberEntity => item !== null)
}
