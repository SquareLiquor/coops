import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { UserType } from '../entities/user'
import type { SigninFormData, SignupFormData } from './form'

export interface AuthState {
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

export interface HookContext {
  supabase: SupabaseClient // CSR/SSR 양쪽에서 사용 가능하도록 supabase 클라이언트 포함
}

export interface SignupHookContext extends HookContext {
  signupData: SignupFormData
  userId?: string | null
}

export interface SigninHookContext extends HookContext {
  signinData: SigninFormData
  userId?: string | null
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
