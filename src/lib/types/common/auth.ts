import type { User } from '@supabase/supabase-js'
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

export interface SignupContext {
  formData: SignupFormData
  createdUser?: User | null
}

export interface SigninContext {
  formData: SigninFormData
  user?: User | null
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
