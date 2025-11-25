import type { User } from '@supabase/supabase-js'
import type { UserType } from '../enums'

export interface AuthState {
  id: string

  // 기본 인증 상태
  isAuthenticated: boolean
  isLoading: boolean

  // 사용자 정보
  user: User | null
  userType: UserType | null

  // 세션 정보
  sessionExpiry: number | null

  // 에러 상태
  error: string | null
}
