import { ApprovalError } from '$lib/errors'
import { ApprovalStatus } from '$lib/types'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'

const requestSelectQuery = `
  *,
  applicant:applicant_id (*),
  approver:approver_id (*),
  store:store_id (*)
`

export const signout = async () => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  await supabase.auth.signOut()
}

export const getApprovalRequests = async () => {}

export const approveRequest = async (id: string, userId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('signup_approval_requests')
    .update({
      status: ApprovalStatus.APPROVED.code,
      approver_id: userId,
      reason: '사용자 확인 완료',
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(requestSelectQuery)
    .maybeSingle()

  if (error) {
    throw new ApprovalError('승인 처리 중 오류가 발생했습니다.', {
      code: 'APPROVAL_PROCESSING_FAILED',
      details: { error: error.message },
    })
  }

  return { data }
}

export const rejectRequest = async (id: string, userId: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase
    .from('signup_approval_requests')
    .update({
      status: ApprovalStatus.REJECTED.code,
      approver_id: userId,
      reason: '사용자 확인 불가',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(requestSelectQuery)
    .maybeSingle()

  if (error) {
    throw new ApprovalError('거부 처리 중 오류가 발생했습니다.', {
      code: 'REJECTION_PROCESSING_FAILED',
      details: { error: error.message },
    })
  }

  return { data }
}
