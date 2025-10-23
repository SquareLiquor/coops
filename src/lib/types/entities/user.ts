import type { ApprovalStatus } from '../common'
import type { StoreData } from './store'

export interface ProfileData {
  id: string
  name: string
  email: string
  phone?: string
  profile_image?: string
  created_at?: string
  updated_at?: string
}

export interface ApprovalRequestData {
  id: string
  applicant_id: string
  approver_id?: string
  store_id?: string
  status?: ApprovalStatus
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
