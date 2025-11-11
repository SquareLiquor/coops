import type { AuthState } from '$lib/types'
import { getUserType } from '$lib/utils/permissions'
import type { User } from '@supabase/supabase-js'

const getInitialState = (): AuthState => ({
  id: '',
  isAuthenticated: false,
  isLoading: false,
  user: null,
  userType: null,
  sessionExpiry: null,
  error: null,
})

let authState = $state<AuthState>(getInitialState())

const getAuth = () => authState

const setAuth = (user: User | null, sessionExpiry?: number | null) => {
  const userType = getUserType({ user })

  authState = {
    id: user?.id || '',
    isAuthenticated: !!user,
    isLoading: false,
    user,
    userType: userType || null,
    sessionExpiry: sessionExpiry || null,
    error: null,
  }
}

const setLoading = (loading: boolean) => {
  authState = {
    ...authState,
    isLoading: loading,
  }
}

const setError = (error: string | null) => {
  authState = {
    ...authState,
    error,
    isLoading: false,
  }
}

const clearAuth = () => {
  authState = getInitialState()
}

export { clearAuth, getAuth, setAuth, setError, setLoading }
