import type { Session, User } from '@supabase/supabase-js'
import { clearAuth, setAuth } from './state.svelte'

/**
 * 사용자 인증 상태를 AuthState 스토어에 동기화
 * - SSR 및 CSR 모두에서 사용 가능
 *
 * @param user Supabase User 객체
 * @param session Supabase Session 객체
 */
export function syncUserToAuthState(user: User | null, session?: Session | null) {
  if (!user) {
    clearAuth()
    return
  }

  const sessionExpiryMs = session?.expires_at ? session.expires_at * 1000 : null

  // AuthState 업데이트
  setAuth(user, sessionExpiryMs)
}
