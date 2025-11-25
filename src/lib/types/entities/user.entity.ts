import type { ApprovalStatus } from '../common'
import type { StoreEntity } from './store.entity'

export interface ProfileEntity {
  id: string
  name: string
  email: string
  phone?: string
  profileImage?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApprovalRequestEntity {
  id: string
  applicantId: string
  approverId?: string
  storeId?: string
  status?: ApprovalStatus
  reason?: string
  applicant?: ProfileEntity
  approver?: ProfileEntity
  store?: StoreEntity
  requestedAt?: string | null
  approvedAt?: string | null
  cancelledAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}
