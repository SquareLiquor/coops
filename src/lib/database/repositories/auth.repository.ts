import { ApprovalError } from '$lib/errors'
import { ApprovalStatus } from '$lib/types'
import { isBrowser } from '@supabase/ssr'
import { createBrowserClient, createServerClient } from '../clients'
import { paginate } from '../utils/pagination.util'

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

export const getApprovalRequests = async (filters: {
  status?: string
  storeId?: string
  dateFrom?: string
  dateTo?: string
  page: number
  pageSize: number
}) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()
  const { status, storeId, dateFrom, dateTo, page, pageSize } = filters

  let query = supabase
    .from('signup_approval_requests')
    .select(requestSelectQuery, { count: 'exact' })
    .not('store_id', 'is', null)

  if (status) query = query.eq('status', status)
  if (storeId) query = query.eq('store_id', storeId)
  if (dateFrom) query = query.gte('requested_at', dateFrom)
  if (dateTo) query = query.lte('requested_at', dateTo)

  const result = await paginate(query.order('created_at', { ascending: false }), { page, pageSize }).execute()

  return result
}

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

export const createProfile = async (userId: string, payload: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  // 프로필이 이미 존재하는지 확인
  const { data: existing } = await supabase.from('profiles').select('*').eq('id', userId)

  if (!existing || existing.length === 0) {
    const { error } = await supabase.from('profiles').insert(payload)
    if (error) throw error
  }
}

export const updateUserMetadata = async (userId: string, storeType?: string) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { error } = await supabase.functions.invoke('grant_user_role', {
    method: 'POST',
    body: {
      user_id: userId,
      user_type: !storeType ? 'consummer' : storeType,
    },
  })

  if (error) throw error
}

export const insertApprovalRequest = async (payload: any) => {
  const supabase = isBrowser() ? createBrowserClient() : createServerClient()

  const { data, error } = await supabase.from('signup_approval_requests').insert(payload)
  if (error) throw error

  return { data }
}
