import { equalsEnum, UserType } from '$lib/types'
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

  if (equalsEnum(UserType.CONSUMER, user_type) && url.pathname === '/') {
    throw redirect(303, '/coops')
  }

  if (equalsEnum(UserType.BRANCH, user_type) && url.pathname === '/') {
    throw redirect(303, '/admin')
  }

  if (equalsEnum(UserType.HQ, user_type) && url.pathname === '/') {
    throw redirect(303, '/hq')
  }

  if (equalsEnum(UserType.BRANCH, user_type) && url.pathname.startsWith('/admin')) {
    throw redirect(303, '/')
  }

  if (equalsEnum(UserType.HQ, user_type) && url.pathname.startsWith('/hq')) {
    throw redirect(303, '/')
  }

  return resolve(event)
}
