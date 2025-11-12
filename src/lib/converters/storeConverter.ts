import type { StoreData, StoreMemberData } from '$lib/types'
import dayjs from 'dayjs'
import { profileDataConverter } from './profileConverter'

export const storeDataConverter = () => {
  const convert = (data: any): StoreData | undefined => {
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
      owner: profileDataConverter().convert(owner),
      createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): StoreData[] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is StoreData => item !== undefined)
  }

  return { convert, convertAll }
}

export const storeMemberDataConverter = () => {
  const convert = (data: any): StoreMemberData | undefined => {
    if (!data) return undefined

    const { id, store_id, user_id, store, profile, created_at } = data

    return {
      id,
      storeId: store_id,
      userId: user_id,
      store: storeDataConverter().convert(store),
      profile: profileDataConverter().convert(profile),
      createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): StoreMemberData[] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is StoreMemberData => item !== null)
  }

  return { convert, convertAll }
}
