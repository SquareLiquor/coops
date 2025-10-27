import type { StoreMemberData } from '$lib/types'
import dayjs from 'dayjs'
import { profileDataConverter } from './profileConverter'
import { storeDataConverter } from './storeConverter'

export const storeMemberDataConverter = () => {
  const convert = (data: any): StoreMemberData | undefined => {
    if (!data) return undefined

    const { id, store_id, user_id, store, profile, created_at } = data

    return {
      id,
      store_id,
      user_id,
      store: storeDataConverter().convert(store),
      profile: profileDataConverter().convert(profile),
      created_at: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const convertAll = (datas: any[]): StoreMemberData[] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is StoreMemberData => item !== null)
  }

  return { convert, convertAll }
}
