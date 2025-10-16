import { ApprovalStatus } from '$lib/types'
import { type Handle, redirect } from '@sveltejs/kit'

/**
 * 사용자의 승인 상태를 확인하는 가드 미들웨어
 * @param param0
 * @returns
 */
export const approvalStatusGuard: Handle = async ({ event, resolve }) => {
  const {
    locals: { user },
    url,
  } = event

  const { app_metadata: { approve_status = undefined } = {} } = user || {}

  if (approve_status === ApprovalStatus.PENDING && !url.pathname.startsWith('/auth/pending')) {
    throw redirect(303, '/auth/pending')
  }

  return resolve(event)
}
