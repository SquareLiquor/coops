import { UserType } from '$lib/types'
import { type Handle, redirect } from '@sveltejs/kit'

/**
 * 인증 상태를 확인하는 가드 미들웨어
 * @param param0
 * @returns
 */
export const authenticatedGuard: Handle = async ({ event, resolve }) => {
  const {
    locals: { session, user },
    url,
    route,
  } = event

  const { app_metadata: { user_type } = {} } = user || {}
  const auth_protected_path = '(authenticated)'

  if (!session && route.id?.includes(auth_protected_path)) {
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/hq')) {
      throw redirect(303, '/auth/admin')
    }

    throw redirect(303, '/auth')
  }

  if (session && ['/auth', '/auth/admin'].includes(url.pathname)) {
    throw redirect(
      303,
      UserType.CONSUMER.code === user_type ? '/' : UserType.BRANCH.code === user_type ? '/admin' : '/hq'
    )
  }

  return resolve(event)
}
