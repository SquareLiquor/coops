import type { ApprovalStatus } from '../common'
import type { StoreData } from './store'

export interface ProfileData {
  id: string
  name: string
  email: string
  phone?: string
  profileImage?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApprovalRequestData {
  id: string
  applicantId: string
  approverId?: string
  storeId?: string
  status?: ApprovalStatus
  reason?: string
  applicant?: ProfileData
  approver?: ProfileData
  store?: StoreData
  requestedAt?: string | null
  approvedAt?: string | null
  cancelledAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}
