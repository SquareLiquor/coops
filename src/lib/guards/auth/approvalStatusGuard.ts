import { ApprovalStatus } from '$lib/types'
import { type Handle, redirect } from '@sveltejs/kit'

/**
 * 사용자의 승인 상태를 확인하는 가드 미들웨어
 * @param param0
 * @returns
 */
export const approvalStatusGuard: Handle = async ({ event, resolve }) => {
  const {
    locals: { user, supabase },
    url,
  } = event

  const { user_metadata } = user || {}

  // 해당 사용자의 최신 승인 요청 상태 조회
  const { data, error } = await supabase
    .from('signup_approval_requests')
    .select('status')
    .eq('applicant_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (data?.status === ApprovalStatus.PENDING && !url.pathname.startsWith('/auth/pending')) {
    throw redirect(303, '/auth/pending')
  }

  return resolve(event)
}
