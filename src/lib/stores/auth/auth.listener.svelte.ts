import { invalidate } from '$app/navigation'
import { createBrowserClient } from '$lib/database'
import type { Session } from '@supabase/supabase-js'
import { clearStore } from '../store'
import { clearAuth, setError, setLoading } from './auth.state.svelte'
import { syncUserToAuthState } from './auth.sync.svelte'

let sessionState = $state<Session | null>(null)

const updateSessionState = (newSession: Session | null) => {
  sessionState = newSession
}

const snapshotSessionState = (newSession: Session | null) => {
  const prevSessionState = $state.snapshot(sessionState)
  updateSessionState(newSession)

  return { prevSession: prevSessionState, currentSession: sessionState }
}

/**
 * 세션이 변경되었는지 확인
 * @param prevSession 이전 세션
 * @param newSession 새로운 세션
 * @returns 세션이 변경되었으면 true
 */
const hasSessionChanged = (prevSession: Session | null, newSession: Session | null): boolean => {
  // 둘 다 null이면 변경 없음
  if (!prevSession && !newSession) return false

  // 하나만 null이면 변경됨 (로그인/로그아웃)
  if (!prevSession || !newSession) return true

  // 만료 시간이 다르면 변경됨 (세션 갱신)
  if (prevSession.expires_at !== newSession.expires_at) return true

  // access_token이 다르면 변경됨
  if (prevSession.access_token !== newSession.access_token) return true

  return false
}

/**
 * 브라우저에서 Supabase 인증 상태 변화를 실시간으로 감지하는 리스너
 *
 * @returns cleanup 함수 - 컴포넌트 언마운트 시 호출하여 구독을 해제
 */
export function setupAuthStateListener() {
  const supabase = createBrowserClient()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    const { prevSession, currentSession } = snapshotSessionState(session)

    try {
      setLoading(true)

      const sessionChanged = hasSessionChanged(prevSession, currentSession)
      if (sessionChanged) {
        if (event === 'SIGNED_OUT') {
          clearAuth()
          clearStore()
          window.location.href = '/'
        }
        invalidate('supabase:auth')
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        setError(`인증 오류: ${error.message}`)
        return
      }

      // 사용자 상태를 AuthState 스토어에 동기화
      syncUserToAuthState(user, currentSession)
    } catch (error) {
      setError(`인증 처리 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  })

  return () => subscription.unsubscribe()
}
