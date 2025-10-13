import { getRequestEvent } from '$app/server'
// import { SUPABASE_SECRET_KEY } from '$env/static/private'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import {
  createServerClient as _createServerClient,
  type CookieMethodsServer,
  type CookieOptionsWithName,
} from '@supabase/ssr'
import { type SupabaseClientOptions } from '@supabase/supabase-js'

/**
 * Create a Supabase server client.
 */
export const createServerClient = (
  options?: SupabaseClientOptions<'public'> & {
    cookieEncoding?: 'raw' | 'base64url'
    cookieOptions?: CookieOptionsWithName
    cookies: CookieMethodsServer
  }
) => {
  const event = getRequestEvent()

  return _createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' })
        })
      },
    },
    ...options,
  })
}
