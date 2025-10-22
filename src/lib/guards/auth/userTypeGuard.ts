import { UserType } from '$lib/types'
import { redirect, type Handle } from '@sveltejs/kit'

/**
 * 사용자의 유형을 확인하는 가드 미들웨어
 * @param param0
 * @returns
 */
export const userTypeGuard: Handle = async ({ event, resolve }) => {
  const {
    locals: { user },
    url,
  } = event

  const { app_metadata } = user || {}
  const { user_type } = app_metadata || {}

  if (user_type === UserType.CONSUMER && url.pathname === '/') {
    throw redirect(303, '/coops')
  }

  if (user_type === UserType.BRANCH && url.pathname === '/') {
    throw redirect(303, '/admin')
  }

  if (user_type === UserType.HQ && url.pathname === '/') {
    throw redirect(303, '/hq')
  }

  if (user_type !== UserType.BRANCH && url.pathname.startsWith('/admin')) {
    throw redirect(303, '/')
  }

  if (user_type !== UserType.HQ && url.pathname.startsWith('/hq')) {
    throw redirect(303, '/')
  }

  return resolve(event)
}
