import type { ProfileData } from '$lib/types'
import dayjs from 'dayjs'

export const profileDataConverter = () => {
  const convert = (data: any): ProfileData | undefined => {
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

  const convertAll = (datas: any[]): ProfileData[] | [] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is ProfileData => item !== null)
  }

  return { convert, convertAll }
}
