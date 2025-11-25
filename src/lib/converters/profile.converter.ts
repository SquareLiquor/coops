import type { ProfileEntity } from '$lib/types'
import dayjs from 'dayjs'

export const toProfileEntity = (data: any): ProfileEntity | undefined => {
  if (!data) return undefined

  const { id, name, email, phone, profile_image, created_at, updated_at } = data

  return {
    id,
    name,
    email,
    phone,
    profileImage: profile_image,
    createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss'),
  }
}

export const toProfileEntities = (datas: any[] | null): ProfileEntity[] | [] => {
  if (!datas) return []

  return datas.map(toProfileEntity).filter((item): item is ProfileEntity => item !== null)
}
