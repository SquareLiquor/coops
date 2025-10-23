import { ApprovalStatus, type SignupApprovalRequestData, type SignupFormData } from '$lib/types'
import dayjs from 'dayjs'
import { profileDataConverter } from './profileConverter'
import { storeDataConverter } from './storeConverter'

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

export const approvalRequestDataConverter = () => {
  const convert = (data: any): SignupApprovalRequestData | undefined => {
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
      applicant_id,
      approver_id,
      store_id,
      status: ApprovalStatus[(status as string).toUpperCase()],
      reason,
      requested_at: dayjs(requested_at).isValid() ? dayjs(requested_at).format('YYYY-MM-DD HH:mm:ss') : null,
      approved_at: dayjs(approved_at).isValid() ? dayjs(approved_at).format('YYYY-MM-DD HH:mm:ss') : null,
      cancelled_at: dayjs(cancelled_at).isValid() ? dayjs(cancelled_at).format('YYYY-MM-DD HH:mm:ss') : null,
      created_at: dayjs(created_at).isValid() ? dayjs(created_at).format('YYYY-MM-DD HH:mm:ss') : null,
      updated_at: dayjs(updated_at).isValid() ? dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss') : null,
      applicant: profileDataConverter().convert(applicant),
      approver: profileDataConverter().convert(approver),
      store: storeDataConverter().convert(store),
    }
  }

  const convertAll = (datas: any[]): SignupApprovalRequestData[] => {
    if (!datas) return []

    return datas.map(convert).filter((item): item is SignupApprovalRequestData => item !== null)
  }

  return { convert, convertAll }
}
