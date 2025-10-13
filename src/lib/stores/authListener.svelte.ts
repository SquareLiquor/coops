import { invalidate } from '$app/navigation'
import type { Session, User } from '@supabase/supabase-js'
import { clearAuth, setAuth } from '$lib/stores/auth.svelte'
import { createBrowserClient } from '$lib/supabase/browser'

let lastSession = $state<Session | null>(null)

// CSR: 브라우저에서 실시간 인증 상태 감지
export function initAuthListener() {
  const supabase = createBrowserClient()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, newSession) => {
    const prevSession = snapshotSession(newSession)

    if (!prevSession?.expires_at !== !newSession?.expires_at) {
      if (event === 'SIGNED_OUT') window.location.href = '/'
      invalidate('supabase:auth')
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('onAuthStateChange', {
      event,
      prevSession: prevSession?.expires_at,
      newSession: newSession?.expires_at,
    })

    if (!user) {
      syncAuthFromUser(user)
      return
    }
  })
  return () => subscription.unsubscribe
}

const snapshotSession = (newSession: Session | null) => {
  const preSession = $state.snapshot(lastSession)

  lastSession = newSession

  return preSession
}

// SSR/CSR 모두에서 사용할 수 있는 store 동기화 함수
export function syncAuthFromUser(user: User | null) {
  if (!user) {
    clearAuth()
    return
  }
  setAuth({ user })
}
