import type { User } from '@supabase/supabase-js'
import type { StoreData } from '../entities'
import type { ProfileData, UserType } from '../entities/user'

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

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

export interface SignupApprovalRequestData {
  id: string
  applicant_id: string
  approver_id?: string
  store_id?: string
  status: ApprovalStatus
  reason?: string
  applicant?: ProfileData
  approver?: ProfileData
  store?: StoreData
  requested_at?: string | null
  approved_at?: string | null
  cancelled_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}
