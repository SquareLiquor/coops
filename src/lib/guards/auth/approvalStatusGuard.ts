import { createServerClient } from '$lib/supabase'
import { ApprovalStatus } from '$lib/types'
import { type Handle, redirect } from '@sveltejs/kit'

/**
 * 사용자의 승인 상태를 확인하는 가드 미들웨어
 * @param param0
 * @returns
 */
export const approvalStatusGuard: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient()
  const {
    url,
    locals: { session },
  } = event

  // TODO: user id??
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { id } = user || {}
  console.log('Approval Status Guard - User:', session)

  // 해당 사용자의 최신 승인 요청 상태 조회
  const { data, error } = await supabase
    .from('signup_approval_requests')
    .select('status')
    .eq('applicant_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  console.log('Approval Status Guard:', { data, error })
  if (data?.status === ApprovalStatus.PENDING && !url.pathname.startsWith('/auth/pending')) {
    throw redirect(303, '/auth/pending')
  }

  return resolve(event)
}
