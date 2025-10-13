import type { User } from '@supabase/supabase-js'

export interface AuthState {
  authenticated: boolean
  user: User | null
}

const authState = $state<AuthState>({
  authenticated: false,
  user: null,
})

const setAuth = (newState: Partial<AuthState>) => {
  authState.authenticated = !!newState.user
  authState.user = newState.user || null
}

const clearAuth = () => {
  authState.authenticated = false
  authState.user = null
}

export { authState as auth, clearAuth, setAuth }
