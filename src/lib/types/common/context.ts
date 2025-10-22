import type { SupabaseClient } from '@supabase/supabase-js'
import type { SigninFormData, SignupFormData } from './form'

export interface HookContext {
  supabase: SupabaseClient // CSR/SSR 양쪽에서 사용 가능하도록 supabase 클라이언트 포함
}

export interface SignupHookContext {
  signupData: SignupFormData
  userId?: string | null
}

export interface SigninHookContext {
  signinData: SigninFormData
  userId?: string | null
}
