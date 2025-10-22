import type { StoreData } from './store'

// 사용자 역할
export enum UserType {
  CONSUMER = 'consumer',
  BRANCH = 'branch',
  HQ = 'hq',
}

// export enum ApprovalStatus {
//   PENDING = 'pending',
//   APPROVED = 'approved',
//   REJECTED = 'rejected',
// }
export const ApprovalStatus = {
  PENDING: { code: 'pending', label: '승인대기' },
  APPROVED: { code: 'approved', label: '승인완료' },
  REJECTED: { code: 'rejected', label: '거부됨' },
} as const

export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus]

// 사용자 기본 정보
export interface ProfileData {
  id: string
  name: string
  email: string
  phone?: string
  profile_image?: string
  created_at?: string
  updated_at?: string
}

export interface SignupApprovalRequestData {
  id: string
  applicant_id: string
  approver_id?: string
  store_id?: string
  status: ApprovalStatus['code']
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
