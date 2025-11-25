import type { SignupFormData } from '$lib/types'

export interface SignupHookContext {
  signupData: SignupFormData
  userId?: string | null
}
