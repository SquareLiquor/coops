import type { StoreData } from '$lib/types'
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
      address_detail,
      latitude,
      longitude,
      place_id,
      phone,
      owner_id,
      owner: profileDataConverter().convert(owner),
      created_at: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
      updated_at: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): StoreData[] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is StoreData => item !== undefined)
  }

  return { convert, convertAll }
}
