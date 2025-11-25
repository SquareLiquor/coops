import { ApprovalStatus, type ApprovalRequestEntity, type SignupFormData } from '$lib/types'
import { lookupEnum } from '$lib/utils/enum'
import dayjs from 'dayjs'
import { toProfileEntity } from './profile.converter'
import { toStoreEntity } from './store.converter'

// form to context
export const signupFormConverter = (raw: Record<string, string | undefined>): SignupFormData => {
  const { email, name, phone1, phone2, phone3, password, confirmPassword, store } = raw

  return {
    email: email ?? '',
    name: name ?? '',
    phone1: phone1 ?? '',
    phone2: phone2 ?? '',
    phone3: phone3 ?? '',
    password: password ?? '',
    confirmPassword: confirmPassword ?? '',
    storeId: store?.split('|')[0] ?? '',
    storeType: store?.split('|')[1] ?? '',
  }
}

export const signinFormConverter = (raw: Record<string, string | undefined>) => {
  const { email, password } = raw

  return {
    email: email ?? '',
    password: password ?? '',
  }
}

export const toApprovalRequestEntity = (data: any): ApprovalRequestEntity | undefined => {
  if (!data) return undefined

  const {
    id,
    applicant_id,
    approver_id,
    store_id,
    status,
    reason,
    requested_at,
    approved_at,
    cancelled_at,
    created_at,
    updated_at,
    applicant,
    approver,
    store,
  } = data

  return {
    id,
    applicantId: applicant_id,
    approverId: approver_id,
    storeId: store_id,
    status: lookupEnum(ApprovalStatus, status),
    reason,
    requestedAt: dayjs(requested_at).isValid() ? dayjs(requested_at).format('YYYY-MM-DD HH:mm:ss') : null,
    approvedAt: dayjs(approved_at).isValid() ? dayjs(approved_at).format('YYYY-MM-DD HH:mm:ss') : null,
    cancelledAt: dayjs(cancelled_at).isValid() ? dayjs(cancelled_at).format('YYYY-MM-DD HH:mm:ss') : null,
    createdAt: dayjs(created_at).isValid() ? dayjs(created_at).format('YYYY-MM-DD HH:mm:ss') : null,
    updatedAt: dayjs(updated_at).isValid() ? dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss') : null,
    applicant: toProfileEntity(applicant),
    approver: toProfileEntity(approver),
    store: toStoreEntity(store),
  }
}

export const toApprovalRequestEntities = (datas: any[] | null): ApprovalRequestEntity[] => {
  if (!datas) return []

  return datas.map(toApprovalRequestEntity).filter((item): item is ApprovalRequestEntity => item !== null)
}
