import type { User } from '@supabase/supabase-js'
import type { UserType } from '../types'

/**
 * 사용자 역할 추출
 * @param user Supabase User 객체
 * @returns UserRole 또는 null
 */
export const getUserRole = (user: User | null): UserType | null => {
  if (!user?.app_metadata?.user_type) return null
  return user.app_metadata.user_type as UserType
}

/**
 * 권한 체크 유틸리티
 * @param user Supabase User 객체 또는 role
 * @returns 권한 객체
 */
export const getPermissions = (userOrRole: User | UserType | null) => {
  const role = typeof userOrRole === 'string' ? userOrRole : getUserRole(userOrRole)

  return {
    canAccessAdmin: canAccessAdmin(role),
    canAccessHQ: canAccessHQ(role),
  }
}

export const canAccessAdmin = (userOrRole: User | UserType | null): boolean => {
  const role = typeof userOrRole === 'string' ? userOrRole : getUserRole(userOrRole)
  return role === 'branch'
}

export const canAccessHQ = (userOrRole: User | UserType | null): boolean => {
  const role = typeof userOrRole === 'string' ? userOrRole : getUserRole(userOrRole)
  return role === 'hq'
}
