import { UserType } from '$lib/types'
import type { User } from '@supabase/supabase-js'

interface params {
  user?: User | null
  user_type?: string
}

/**
 * 사용자 역할 추출
 * @param user Supabase User 객체
 * @returns UserRole 또는 null
 */
export const getUserType = ({ user, user_type }: params): UserType | undefined => {
  if (!user && !user_type) return undefined

  let userType = undefined
  !!user && (userType = UserType[user?.app_metadata?.user_type.toUpperCase()])
  !!user_type && (userType = UserType[user_type.toUpperCase()])

  return userType
}

/**
 * 권한 체크 유틸리티
 * @param user Supabase User 객체 또는 role
 * @returns 권한 객체
 */
export const getPermissions = ({ user, user_type }: params) => {
  let userType = getUserType({ user, user_type })

  return {
    canAccessAdmin: canAccessAdmin({ user_type: userType?.code }),
    canAccessHQ: canAccessHQ({ user_type: userType?.code }),
  }
}

export const canAccessAdmin = ({ user, user_type }: params): boolean => {
  if (!user && !user_type) return false

  let userType = getUserType({ user, user_type })

  return userType?.code === 'branch'
}

export const canAccessHQ = ({ user = undefined, user_type }: params): boolean => {
  if (!user && !user_type) return false

  let userType = getUserType({ user, user_type })

  return userType?.code === 'hq'
}
