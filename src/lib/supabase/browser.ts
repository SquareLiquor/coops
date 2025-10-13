// src/lib/supabaseClient.ts
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import {
  createBrowserClient as _createBrowserClient,
  type CookieMethodsBrowser,
  type CookieOptionsWithName,
} from '@supabase/ssr'
import { type SupabaseClientOptions } from '@supabase/supabase-js'

/**
 * Create a Supabase browser client.
 */
export const createBrowserClient = (
  options?: SupabaseClientOptions<'public'> & {
    cookieEncoding?: 'raw' | 'base64url'
    cookieOptions?: CookieOptionsWithName
    cookies?: CookieMethodsBrowser
    isSingleton?: boolean
  }
) => {
  return _createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { ...options })
}
