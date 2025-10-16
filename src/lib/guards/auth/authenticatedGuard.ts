import { type Handle, redirect } from '@sveltejs/kit'

/**
 * 인증 상태를 확인하는 가드 미들웨어
 * @param param0
 * @returns
 */
export const authenticatedGuard: Handle = async ({ event, resolve }) => {
  const {
    locals: { session },
    route,
  } = event

  const auth_protected_path = '(authenticated)'

  if (!session && route.id?.includes(auth_protected_path)) {
    throw redirect(303, '/auth')
  }

  return resolve(event)
}
